"use server";

import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  findDiagnosticQuestion,
  scoreDiagnosticAnswer,
  validateDiagnosticAnswer,
} from "@/lib/dse-diagnostic";
import { DSE_DIAGNOSTIC_TEMPLATE_KEY } from "@/lib/question-bank/dse-chinese-diagnostic-v1";
import { prisma } from "@/lib/prisma";

const normalizedDuration = z.number().finite().transform((value) =>
  Math.min(86_400_000, Math.max(0, Math.round(value))),
);
const normalizedHintLevel = z.number().finite().transform((value) =>
  Math.min(2, Math.max(0, Math.round(value))),
);
const normalizedRevisionCount = z.number().finite().transform((value) =>
  Math.min(1_000, Math.max(0, Math.round(value))),
);

const saveAnswerSchema = z.object({
  accessToken: z.string().min(32).max(128),
  questionId: z.string().min(3).max(80),
  firstAnswer: z.string().min(1).max(500),
  finalAnswer: z.string().min(1).max(500),
  firstResponseMs: normalizedDuration,
  totalResponseMs: normalizedDuration,
  hintLevel: normalizedHintLevel,
  revisionCount: normalizedRevisionCount,
});

function newAccessToken() {
  return randomBytes(24).toString("hex");
}

function isRetryableStorageError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError &&
    ["P1008", "P2028", "P2034"].includes(error.code);
}

async function wait(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function startOrResumeDiagnosticAction(existingToken?: string, distributionSlug?: string) {
  const distribution = distributionSlug
    ? await prisma.surveyDistribution.findUnique({ where: { slug: distributionSlug } })
    : null;
  if (
    distributionSlug &&
    (!distribution || distribution.templateKey !== DSE_DIAGNOSTIC_TEMPLATE_KEY)
  ) {
    return { ok: false as const, error: "distribution_unavailable" };
  }

  if (existingToken && existingToken.length >= 32) {
    const existing = await prisma.diagnosticAttempt.findUnique({
      where: { accessToken: existingToken },
      include: { answers: { orderBy: { answeredAt: "asc" } } },
    });
    if (
      existing &&
      existing.templateKey === DSE_DIAGNOSTIC_TEMPLATE_KEY &&
      existing.distributionId === (distribution?.id ?? null)
    ) {
      return {
        ok: true as const,
        attemptId: existing.id,
        accessToken: existing.accessToken,
        status: existing.status,
        answeredQuestionIds: existing.answers.map((answer) => answer.questionId),
      };
    }
  }

  const attempt = await prisma.diagnosticAttempt.create({
    data: {
      accessToken: newAccessToken(),
      templateKey: DSE_DIAGNOSTIC_TEMPLATE_KEY,
      distributionId: distribution?.id,
    },
  });

  return {
    ok: true as const,
    attemptId: attempt.id,
    accessToken: attempt.accessToken,
    status: attempt.status,
    answeredQuestionIds: [] as string[],
  };
}

export async function saveDiagnosticAnswerAction(input: unknown) {
  const parsed = saveAnswerSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid_payload" };

  const attempt = await prisma.diagnosticAttempt.findUnique({ where: { accessToken: parsed.data.accessToken } });
  if (!attempt || attempt.status === "completed") {
    return { ok: false as const, error: "attempt_unavailable" };
  }

  const question = findDiagnosticQuestion(parsed.data.questionId);
  if (!question) return { ok: false as const, error: "unknown_question" };
  const hasUsableFirstAnswer = parsed.data.firstAnswer.trim().length > 0;
  if (
    !hasUsableFirstAnswer ||
    !validateDiagnosticAnswer(question, parsed.data.finalAnswer)
  ) {
    return { ok: false as const, error: "invalid_answer" };
  }

  const scored = scoreDiagnosticAnswer(question, parsed.data.finalAnswer);
  for (let storageAttempt = 0; storageAttempt < 3; storageAttempt++) {
    try {
      const existing = await prisma.diagnosticAnswer.findUnique({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: question.id,
          },
        },
      });

      await prisma.$transaction([
        prisma.diagnosticAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: attempt.id,
              questionId: question.id,
            },
          },
          create: {
            attemptId: attempt.id,
            questionId: question.id,
            firstAnswer: parsed.data.firstAnswer,
            finalAnswer: parsed.data.finalAnswer,
            firstResponseMs: parsed.data.firstResponseMs,
            totalResponseMs: parsed.data.totalResponseMs,
            hintLevel: parsed.data.hintLevel,
            revisionCount: parsed.data.revisionCount,
            score: scored.score,
            dimensionScores: scored.dimensionScores as Prisma.InputJsonValue,
          },
          update: {
            finalAnswer: parsed.data.finalAnswer,
            totalResponseMs: parsed.data.totalResponseMs,
            hintLevel: Math.max(existing?.hintLevel ?? 0, parsed.data.hintLevel),
            revisionCount: (existing?.revisionCount ?? 0) + parsed.data.revisionCount,
            score: scored.score,
            dimensionScores: scored.dimensionScores as Prisma.InputJsonValue,
          },
        }),
        prisma.diagnosticAttempt.update({
          where: { id: attempt.id },
          data: { currentModule: question.moduleId },
        }),
      ]);

      return { ok: true as const };
    } catch (error) {
      if (storageAttempt < 2 && isRetryableStorageError(error)) {
        await wait(60 * (storageAttempt + 1));
        continue;
      }
      const code = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : "unknown";
      console.error("Diagnostic answer save failed", { questionId: question.id, code });
      return { ok: false as const, error: "storage_error" };
    }
  }

  return { ok: false as const, error: "storage_error" };
}

export async function completeDiagnosticAttemptAction(accessToken: string) {
  if (typeof accessToken !== "string" || accessToken.length < 32) {
    return { ok: false as const, error: "invalid_token" };
  }

  const attempt = await prisma.diagnosticAttempt.findUnique({
    where: { accessToken },
    include: { _count: { select: { answers: true } } },
  });
  if (!attempt) return { ok: false as const, error: "attempt_unavailable" };
  if (attempt._count.answers < 4) return { ok: false as const, error: "insufficient_answers" };

  await prisma.diagnosticAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
  });

  return { ok: true as const, attemptId: attempt.id, accessToken };
}
