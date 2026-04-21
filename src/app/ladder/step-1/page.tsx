import Link from "next/link";

export default function LadderStep1Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <p className="text-xs font-medium text-zinc-500">第 1 阶梯</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">交互素养</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
        本阶梯对应题库「交互素养 · 短问卷」：如何把需求说清楚、多轮澄清、对输出保持怀疑、以及不泄露敏感信息。问卷由管理员在后台按场景发放，并非固定公开链接。
      </p>
      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-950">
        若你已拿到组织者的填写链接，直接在手机或电脑打开即可；完成后会展示个人评级与下一阶梯入口。
      </div>
      <p className="mt-10">
        <Link href="/ladder" className="text-sm font-medium text-zinc-900 underline">
          ← 返回阶梯总览
        </Link>
      </p>
    </main>
  );
}
