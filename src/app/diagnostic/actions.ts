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

const saveAnswerSchema = z.object({
  accessToken: z.string().min(32).max(128),
  questionId: z.string().min(3).max(80),
  firstAnswer: z.string().min(1).max(500),
  finalAnswer: z.string().min(1).max(500),
  firstResponseMs: z.number().int().min(0).max(3_600_000),
  totalResponseMs: z.number().int().min(0).max(3_600_000),
  hintLevel: z.number().int().min(0).max(2),
  revisionCount: z.number().int().min(0).max(100),
});

function newAccessToken() {
  return randomBytes(24).toString("hex");
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

  const attempt = await prisma.diagnosticAttempt.findUnique({
    where: { accessToken: parsed.data.accessToken },
  });
  if (!attempt || attempt.status === "completed") {
    return { ok: false as const, error: "attempt_unavailable" };
  }

  const question = findDiagnosticQuestion(parsed.data.questionId);
  if (!question) return { ok: false as const, error: "unknown_question" };
  if (
    !validateDiagnosticAnswer(question, parsed.data.firstAnswer) ||
    !validateDiagnosticAnswer(question, parsed.data.finalAnswer)
  ) {
    return { ok: false as const, error: "invalid_answer" };
  }

  const scored = scoreDiagnosticAnswer(question, parsed.data.finalAnswer);
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
