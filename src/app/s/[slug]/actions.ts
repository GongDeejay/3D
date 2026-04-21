"use server";

import { redirect } from "next/navigation";

import { buildAnswersSchema } from "@/lib/answers-schema";
import { INTERACTION_LITERACY_V1 } from "@/lib/question-bank/interaction-literacy-v1";
import { prisma } from "@/lib/prisma";

export async function submitSurveyAction(slug: string, formData: FormData) {
  const dist = await prisma.surveyDistribution.findUnique({ where: { slug } });
  if (!dist) {
    redirect("/");
  }

  const raw: Record<string, unknown> = {};
  if (dist.templateKey === INTERACTION_LITERACY_V1.templateKey) {
    for (const q of INTERACTION_LITERACY_V1.questions) {
      const v = formData.get(q.id);
      if (q.kind === "likert") {
        raw[q.id] = v != null && v !== "" ? Number(v) : undefined;
      } else {
        raw[q.id] = v != null && v !== "" ? String(v) : undefined;
      }
    }
  }

  const schema = buildAnswersSchema(dist.templateKey);

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/s/${slug}?error=invalid`);
  }

  const saved = await prisma.surveyResponse.create({
    data: {
      distributionId: dist.id,
      answers: parsed.data as object,
    },
  });

  redirect(`/s/${slug}/done?rid=${encodeURIComponent(saved.id)}`);
}
