"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { makeDistributionSlug } from "@/lib/slug";

async function createDistributionRecord(data: {
  title: string;
  scenarioSummary: string;
  scenarioDetail: string;
}) {
  const maxAttempts = 16;
  for (let i = 0; i < maxAttempts; i++) {
    const slug = makeDistributionSlug();
    try {
      return await prisma.surveyDistribution.create({
        data: {
          ...data,
          slug,
          templateKey: "interaction-literacy-v1",
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

  if (!title || !scenarioSummary) {
    redirect("/admin/new?error=missing");
  }

  const created = await createDistributionRecord({ title, scenarioSummary, scenarioDetail });
  if (!created) {
    redirect("/admin/new?error=slug");
  }

  revalidatePath("/admin");
  redirect(`/admin/${created.id}`);
}
