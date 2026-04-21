import Link from "next/link";
import { notFound } from "next/navigation";

import { analyzeResponses } from "@/lib/analysis";
import { SurveyQrImage } from "@/components/survey-qr";
import { INTERACTION_LITERACY_V1 } from "@/lib/question-bank/interaction-literacy-v1";
import { getPublicOrigin } from "@/lib/public-url";
import { prisma } from "@/lib/prisma";

export default async function DistributionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.surveyDistribution.findUnique({
    where: { id },
    include: { responses: { orderBy: { createdAt: "desc" } } },
  });
  if (!row) notFound();

  const answersList = row.responses.map((r) => r.answers as Record<string, unknown>);
  const insight = analyzeResponses(row.templateKey, answersList);
  const origin = await getPublicOrigin();
  const fillUrl = `${origin}/s/${row.slug}`;

  return (
    <div>
      <Link href="/admin" className="text-sm text-zinc-600 hover:text-zinc-900">
        ← 返回列表
      </Link>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">{row.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          题库：{INTERACTION_LITERACY_V1.title}（{row.templateKey}）
        </p>
        <p className="mt-4 text-sm font-medium text-zinc-800">场景摘要</p>
        <p className="mt-1 text-zinc-700">{row.scenarioSummary}</p>
        {row.scenarioDetail ? (
          <>
            <p className="mt-4 text-sm font-medium text-zinc-800">场景说明（填写者可见）</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700 leading-relaxed">
              {row.scenarioDetail}
            </pre>
          </>
        ) : null}

        <div className="mt-6">
          <p className="text-sm font-medium text-zinc-800">填写链接与二维码</p>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
            <SurveyQrImage url={fillUrl} />
            <div className="min-w-0 flex-1 space-y-2">
              <code className="block break-all rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
                {fillUrl}
              </code>
              <p className="text-xs text-zinc-500">
                生产环境建议在环境变量中设置 NEXT_PUBLIC_BASE_URL，以便生成稳定域名链接与正确二维码内容。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">回收与解读</h2>
        <p className="mt-1 text-sm text-zinc-600">
          本页统计仅针对本批次（{insight.responseCount} 份），用于了解「当时人群」的自评分布与规则化建议。
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">李克特题均分</dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {insight.overallLikertMean != null ? insight.overallLikertMean.toFixed(2) : "—"}
              <span className="ml-1 text-sm font-normal text-zinc-500">/ 5</span>
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">情景题均分</dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {insight.scenarioScore.mean != null ? insight.scenarioScore.mean.toFixed(2) : "—"}
              <span className="ml-1 text-sm font-normal text-zinc-500">
                / {insight.scenarioScore.max}
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="text-sm font-medium text-zinc-800">分维度（李克特）</p>
          <ul className="mt-2 space-y-2 text-sm text-zinc-700">
            {insight.byDimension.map((d) => (
              <li key={d.tag} className="flex justify-between gap-4 rounded-lg border border-zinc-100 px-3 py-2">
                <span>
                  {d.tag === "interaction" ? "交互" : d.tag === "evaluation" ? "评估" : "治理意识（轻量）"}
                </span>
                <span>
                  {d.average != null ? d.average.toFixed(2) : "—"}
                  <span className="text-zinc-400"> （{d.count} 项次）</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <p className="text-sm font-medium text-zinc-800">下一步建议（规则生成）</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700 leading-relaxed">
            {insight.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
