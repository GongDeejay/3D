import Link from "next/link";

export default function LadderStep2Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <p className="text-xs font-medium text-zinc-500">第 2 阶梯</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">评估素养（筹备中）</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
        侧重辨别幻觉、查证来源、判断 AI 回答在什么场景适用。正式测评与互动题尚在开发，上线后将与第一阶梯共用同一后台发放能力。
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-zinc-700">
        <li>可先练习：对任一 AI 回答追问「依据是什么？」并要求给出可核验线索。</li>
        <li>完成第一阶梯且评级稳定后，再进入本阶梯会更省力。</li>
      </ul>
      <p className="mt-10">
        <Link href="/ladder" className="text-sm font-medium text-zinc-900 underline">
          ← 返回阶梯总览
        </Link>
      </p>
    </main>
  );
}
