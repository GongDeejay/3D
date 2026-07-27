import Link from "next/link";

import { createDistributionAction } from "@/app/admin/distributions/actions";

export default async function NewDistributionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="max-w-xl">
      <Link href="/admin" className="text-sm text-zinc-600 hover:text-zinc-900">
        ← 返回列表
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">新建发放</h1>
      <p className="mt-2 text-sm text-zinc-600">
        先选择评测项目，再为本次发放写清楚受众与场景。系统会生成该批次专属的参与链接和二维码。
      </p>

      {sp.error === "missing" ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          请填写标题与场景摘要。
        </p>
      ) : null}
      {sp.error === "slug" ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          创建失败（链接标识冲突），请重试。
        </p>
      ) : null}

      <form action={createDistributionAction} className="mt-8 flex flex-col gap-5">
        <fieldset>
          <legend className="text-sm font-medium text-zinc-800">评测项目</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="cursor-pointer rounded-xl border border-zinc-300 bg-white p-4 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="templateKey"
                value="dse-chinese-diagnostic-v1"
                defaultChecked
                className="sr-only"
              />
              <span className="block font-medium text-zinc-900">DSE 中文诊断</span>
              <span className="mt-1 block text-xs leading-relaxed text-zinc-600">
                两场任务制，记录耗时、提示与修改过程；当前开放第一场信息侦察。
              </span>
            </label>
            <label className="cursor-pointer rounded-xl border border-zinc-300 bg-white p-4 has-[:checked]:border-zinc-700 has-[:checked]:bg-zinc-50">
              <input
                type="radio"
                name="templateKey"
                value="interaction-literacy-v1"
                className="sr-only"
              />
              <span className="block font-medium text-zinc-900">AI 交互素养问卷</span>
              <span className="mt-1 block text-xs leading-relaxed text-zinc-600">
                原有短问卷，用于了解 AI 对话、评估与轻量安全意识。
              </span>
            </label>
          </div>
        </fieldset>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-800">批次标题</span>
          <input
            name="title"
            required
            placeholder="例如：八年级中文能力 · 首次侦察"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-800">场景摘要（一行）</span>
          <input
            name="scenarioSummary"
            required
            placeholder="例如：面向八年级学生，区分未学过与底层能力卡点"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-800">场景说明（可多行）</span>
          <textarea
            name="scenarioDetail"
            rows={5}
            placeholder="填写者将看到全文。可描述场合、期望行为、隐私与匿名说明等。"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          创建并查看链接
        </button>
      </form>
    </div>
  );
}
