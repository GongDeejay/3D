"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@prisma/client";

import { DSE_DIAGNOSTIC_TEMPLATE_KEY } from "@/lib/question-bank/dse-chinese-diagnostic-v1";
import { INTERACTION_LITERACY_V1 } from "@/lib/question-bank/interaction-literacy-v1";
import { prisma } from "@/lib/prisma";
import { makeDistributionSlug } from "@/lib/slug";

const supportedTemplateKeys = [
  INTERACTION_LITERACY_V1.templateKey,
  DSE_DIAGNOSTIC_TEMPLATE_KEY,
] as const;

async function createDistributionRecord(data: {
  title: string;
  scenarioSummary: string;
  scenarioDetail: string;
  templateKey: (typeof supportedTemplateKeys)[number];
}) {
  const maxAttempts = 16;
  for (let i = 0; i < maxAttempts; i++) {
    const slug = makeDistributionSlug();
    try {
      return await prisma.surveyDistribution.create({
        data: {
          ...data,
          slug,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        continue;
      }
      throw e;
    }
  }
  return null;
}

export async function createDistributionAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const scenarioSummary = String(formData.get("scenarioSummary") ?? "").trim();
  const scenarioDetail = String(formData.get("scenarioDetail") ?? "").trim();
  const rawTemplateKey = String(formData.get("templateKey") ?? "");
  const templateKey = supportedTemplateKeys.find((key) => key === rawTemplateKey);

  if (!title || !scenarioSummary || !templateKey) {
    redirect("/admin/new?error=missing");
  }

  const created = await createDistributionRecord({ title, scenarioSummary, scenarioDetail, templateKey });
  if (!created) {
    redirect("/admin/new?error=slug");
  }

  revalidatePath("/admin");
  redirect(`/admin/${created.id}`);
}

export async function deleteDistributionAction(id: string) {
  if (typeof id !== "string" || !id.trim()) {
    return { ok: false as const };
  }

  await prisma.surveyDistribution.deleteMany({
    where: { id },
  });
  revalidatePath("/admin");
  return { ok: true as const };
}
