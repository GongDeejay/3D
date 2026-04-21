import Link from "next/link";

export const metadata = { title: "提示词小抄" };

export default function PromptBasicsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-2xl font-semibold text-zinc-900">巩固：提示词小抄</h1>
      <p className="mt-3 text-sm text-zinc-600">写给日常使用者，可与第一阶梯问卷对照练习。</p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-800">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900">四要素</h2>
          <p className="mt-2">
            <strong>背景</strong>（我是谁/场景）· <strong>目标</strong>（要交付什么）·{" "}
            <strong>约束</strong>（长度、语气、禁忌）· <strong>例子</strong>（好/坏样例各一条）。
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900">多轮</h2>
          <p className="mt-2">第一轮只要「能用的草稿」，第二轮再收紧：补充遗漏约束、改语气、或指定结构（小标题/表格）。</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900">红线</h2>
          <p className="mt-2">密码、身份证号、未公开内部数据、他人隐私，默认不粘贴到任何云端模型。</p>
        </div>
      </section>

      <p className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/ladder" className="font-medium text-zinc-900 underline">
          能力阶梯
        </Link>
        <Link href="/" className="text-zinc-600 underline hover:text-zinc-900">
          首页
        </Link>
      </p>
    </main>
  );
}
