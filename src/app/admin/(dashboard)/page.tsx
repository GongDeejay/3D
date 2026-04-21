import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const rows = await prisma.surveyDistribution.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { responses: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">发放批次</h1>
          <p className="mt-1 text-sm text-zinc-600">
            每次发放可附带不同「场景说明」，回收后按批次查看人群现状与建议。
          </p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          新建发放
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        {rows.length === 0 ? (
          <li className="px-5 py-10 text-center text-sm text-zinc-500">暂无批次，点击「新建发放」开始。</li>
        ) : (
          rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/${r.id}`}
                className="flex flex-col gap-1 px-5 py-4 hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">{r.title}</p>
                  <p className="text-sm text-zinc-500">{r.scenarioSummary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm text-zinc-600">
                  <span>{r._count.responses} 份回收</span>
                  <span className="text-zinc-400">
                    {r.createdAt.toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
