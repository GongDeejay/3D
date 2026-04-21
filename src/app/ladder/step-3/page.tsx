import Link from "next/link";

export default function LadderStep3Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <p className="text-xs font-medium text-zinc-500">第 3 阶梯</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">治理与迁移（筹备中）</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
        侧重数据与合规边界、在工作流中安全接入 AI、以及人机分工与经验迁移。内容规划中。
      </p>
      <p className="mt-10">
        <Link href="/ladder" className="text-sm font-medium text-zinc-900 underline">
          ← 返回阶梯总览
        </Link>
      </p>
    </main>
  );
}
