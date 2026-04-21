import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium text-zinc-500">超级个体能力系统 · MVP</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          AI 交互素养短问卷
        </h1>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          面向大众入门：如何与 AI 对话、澄清需求，并对输出保持基本判断。问卷由管理员按「场景」发放；填写链接仅在对应批次内有效展示。
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          进入管理后台
        </Link>
        <Link
          href="/ladder"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          能力阶梯
        </Link>
        <span className="self-center text-sm text-zinc-500">
          填写入口由管理员分享，无需账号。
        </span>
      </div>
    </main>
  );
}
