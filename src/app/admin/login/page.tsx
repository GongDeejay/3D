import Link from "next/link";

import { loginAction } from "@/app/admin/login/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/admin";

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900">管理后台登录</h1>
      <p className="mt-2 text-sm text-zinc-600">用于创建发放批次、查看回收与解读。</p>

      {sp.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          密码不正确，请重试。
        </p>
      ) : null}

      <form action={loginAction} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-800">密码</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          登录
        </button>
      </form>

      <Link href="/" className="mt-8 text-center text-sm text-zinc-500 hover:text-zinc-800">
        返回首页
      </Link>
    </main>
  );
}
