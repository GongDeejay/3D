import { buildDiagnosticReport } from "@/lib/dse-diagnostic";
import { DSE_DIAGNOSTIC_QUESTIONS } from "@/lib/question-bank/dse-chinese-diagnostic-v1";
import { prisma } from "@/lib/prisma";

export default async function DiagnosticAdminPage() {
  const attempts = await prisma.diagnosticAttempt.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
    include: { answers: true, distribution: true },
  });

  const completed = attempts.filter((attempt) => attempt.status === "completed").length;
  const answerCount = attempts.reduce((sum, attempt) => sum + attempt.answers.length, 0);
  const hintCount = attempts.reduce(
    (sum, attempt) => sum + attempt.answers.filter((answer) => answer.hintLevel > 0).length,
    0,
  );

  return (
    <div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">DSE 中文 · 题库 v1</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">诊断任务后台</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          查看匿名任务完成情况与过程信号。当前报告规则用于原型校准，不代表已验证量表。
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        {[
          ["诊断任务", attempts.length],
          ["已完成", completed],
          ["作答记录", answerCount],
          ["调用提示", hintCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="font-medium text-zinc-900">最近 50 次匿名任务</h2>
        </div>
        {attempts.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-zinc-500">暂无诊断记录。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">开始时间</th>
                  <th className="px-4 py-3 font-medium">发放批次</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">进度</th>
                  <th className="px-4 py-3 font-medium">原始表现</th>
                  <th className="px-4 py-3 font-medium">提示改善</th>
                  <th className="px-4 py-3 font-medium">当前主要卡点</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {attempts.map((attempt) => {
                  const report = buildDiagnosticReport(attempt.answers);
                  return (
                    <tr key={attempt.id} className="text-zinc-700">
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-500">
                        {attempt.startedAt.toLocaleString("zh-CN", { timeZone: "Asia/Hong_Kong" })}
                      </td>
                      <td className="px-4 py-4">
                        {attempt.distribution?.title ?? <span className="text-zinc-400">演示入口</span>}
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
                      <td className="px-4 py-4 tabular-nums">{Math.round(report.overallScore * 100)}%</td>
                      <td className="px-4 py-4 tabular-nums">{Math.round(report.tacticalAdaptability * 100)}%</td>
                      <td className="px-4 py-4">{report.primaryBottleneck.title}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-zinc-500">
        隐私说明：此页面不显示匿名续做 token。后续加入音频与手写材料前，需先实现独立家长查看码、保留期和删除机制。
      </p>
    </div>
  );
}
