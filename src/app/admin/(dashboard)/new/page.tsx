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
        为本次发放写清楚「场景」：受众是谁、在什么场合填写、组织者希望解决什么问题。填写者将在问卷顶部看到这段说明。
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
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-800">批次标题</span>
          <input
            name="title"
            required
            placeholder="例如：社区讲座 · 课后反馈"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-800">场景摘要（一行）</span>
          <input
            name="scenarioSummary"
            required
            placeholder="例如：面向首次接触 ChatGPT 的居民"
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
