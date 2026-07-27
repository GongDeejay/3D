import Link from "next/link";
import { notFound } from "next/navigation";

import { analyzeResponses } from "@/lib/analysis";
import { buildDiagnosticReport } from "@/lib/dse-diagnostic";
import { SurveyQrImage } from "@/components/survey-qr";
import { DSE_DIAGNOSTIC_QUESTIONS, DSE_DIAGNOSTIC_TEMPLATE_KEY } from "@/lib/question-bank/dse-chinese-diagnostic-v1";
import { INTERACTION_LITERACY_V1 } from "@/lib/question-bank/interaction-literacy-v1";
import { getPublicOrigin } from "@/lib/public-url";
import { prisma } from "@/lib/prisma";

export default async function DistributionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.surveyDistribution.findUnique({
    where: { id },
    include: {
      responses: { orderBy: { createdAt: "desc" } },
      diagnosticAttempts: {
        orderBy: { startedAt: "desc" },
        include: { answers: true },
      },
    },
  });
  if (!row) notFound();

  const origin = await getPublicOrigin();
  const isDiagnostic = row.templateKey === DSE_DIAGNOSTIC_TEMPLATE_KEY;
  const fillUrl = `${origin}/${isDiagnostic ? "d" : "s"}/${row.slug}`;

  if (isDiagnostic) {
    const completed = row.diagnosticAttempts.filter((attempt) => attempt.status === "completed");
    const reports = row.diagnosticAttempts.map((attempt) => ({
      attempt,
      report: buildDiagnosticReport(attempt.answers),
    }));
    const averageCompletion = reports.length
      ? reports.reduce((sum, item) => sum + item.report.completionRate, 0) / reports.length
      : 0;
    const averageAdaptability = reports.length
      ? reports.reduce((sum, item) => sum + item.report.tacticalAdaptability, 0) / reports.length
      : 0;

    return (
      <div>
        <Link href="/admin" className="text-sm text-zinc-600 hover:text-zinc-900">
          ← 返回列表
        </Link>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                DSE 中文诊断
              </span>
              <h1 className="mt-3 text-2xl font-semibold text-zinc-900">{row.title}</h1>
              <p className="mt-1 text-xs text-zinc-500">{row.templateKey}</p>
            </div>
            <span className="rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
              第一场 · {DSE_DIAGNOSTIC_QUESTIONS.length} 题
            </span>
          </div>
          <p className="mt-5 text-sm font-medium text-zinc-800">发放场景</p>
          <p className="mt-1 text-sm text-zinc-700">{row.scenarioSummary}</p>
          {row.scenarioDetail ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
              {row.scenarioDetail}
            </pre>
          ) : null}

          <div className="mt-7 border-t border-zinc-100 pt-6">
            <p className="text-sm font-medium text-zinc-800">参评链接与二维码</p>
            <p className="mt-1 text-xs text-zinc-500">
              将此链接发给所有参评用户。每台设备会建立独立匿名任务，并自动保存进度。
            </p>
            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
              <SurveyQrImage url={fillUrl} />
              <div className="min-w-0 flex-1 space-y-3">
                <code className="block break-all rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
                  {fillUrl}
                </code>
                <Link
                  href={fillUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  打开参评页面 ↗
                </Link>
                <p className="text-xs leading-relaxed text-zinc-500">
                  同一浏览器再次打开会继续未完成任务；完成后再次打开会回到个人结果。换设备或无痕窗口会建立新的匿名任务。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {[
            ["参与任务", row.diagnosticAttempts.length],
            ["已完成", completed.length],
            ["平均完成度", `${Math.round(averageCompletion * 100)}%`],
            ["平均提示改善", `${Math.round(averageAdaptability * 100)}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="font-medium text-zinc-900">本批次匿名参与记录</h2>
            <p className="mt-1 text-xs text-zinc-500">不显示续做 token；报告结论仅用于原型校准。</p>
          </div>
          {reports.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-zinc-500">尚无人打开参评链接。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-zinc-50 text-xs text-zinc-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">开始时间</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="px-4 py-3 font-medium">进度</th>
                    <th className="px-4 py-3 font-medium">提示改善</th>
                    <th className="px-4 py-3 font-medium">主要卡点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {reports.map(({ attempt, report }) => (
                    <tr key={attempt.id}>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-500">
                        {attempt.startedAt.toLocaleString("zh-CN", { timeZone: "Asia/Hong_Kong" })}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs ${
                          attempt.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {attempt.status === "completed" ? "已完成" : "进行中"}
                        </span>
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        {attempt.answers.length} / {DSE_DIAGNOSTIC_QUESTIONS.length}
                      </td>
                      <td className="px-4 py-4 tabular-nums">{Math.round(report.tacticalAdaptability * 100)}%</td>
                      <td className="px-4 py-4 text-zinc-700">{report.primaryBottleneck.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  const answersList = row.responses.map((r) => r.answers as Record<string, unknown>);
  const insight = analyzeResponses(row.templateKey, answersList);

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
