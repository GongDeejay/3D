import Link from "next/link";

import { LADDER_STEPS } from "@/lib/ladder";

export const metadata = {
  title: "能力阶梯",
};

export default function LadderPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-zinc-900">AI 素养 · 能力阶梯</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
        从大众化「交互」入门，再到评估、治理与迁移。当前 MVP 已实现第一阶梯短问卷；其余阶梯将按同一套「测评 → 反馈 → 进阶」逻辑陆续接入。
      </p>

      <ol className="mt-10 space-y-4">
        {LADDER_STEPS.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/ladder/${s.slug}`}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-medium text-zinc-500">第 {s.order} 阶梯</p>
                <p className="mt-1 font-medium text-zinc-900">{s.title}</p>
                <p className="mt-1 text-sm text-zinc-600">{s.short}</p>
              </div>
              <span
                className={`mt-3 inline-flex shrink-0 self-start rounded-full px-3 py-1 text-xs font-medium sm:mt-0 ${
                  s.available ? "bg-emerald-100 text-emerald-900" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {s.available ? "已开放测评" : "筹备中"}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-center">
        <Link href="/" className="text-sm text-zinc-600 underline hover:text-zinc-900">
          返回首页
        </Link>
      </p>
    </main>
  );
}
