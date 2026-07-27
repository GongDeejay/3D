import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DiagnosticRunner } from "@/app/diagnostic/diagnostic-runner";
import { DSE_DIAGNOSTIC_TEMPLATE_KEY, getPublicDiagnosticBank } from "@/lib/question-bank/dse-chinese-diagnostic-v1";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "参与中文诊断 | DSE中文情报侦察站",
  description: "使用发放者提供的专属链接参与中文信息处理能力诊断。",
};

export default async function DistributedDiagnosticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const distribution = await prisma.surveyDistribution.findUnique({
    where: { slug },
  });
  if (!distribution || distribution.templateKey !== DSE_DIAGNOSTIC_TEMPLATE_KEY) notFound();

  return (
    <DiagnosticRunner
      bank={getPublicDiagnosticBank()}
      distribution={{
        slug: distribution.slug,
        title: distribution.title,
        scenarioSummary: distribution.scenarioSummary,
        scenarioDetail: distribution.scenarioDetail,
      }}
    />
  );
}
