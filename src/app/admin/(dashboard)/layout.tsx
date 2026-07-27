import Link from "next/link";

import { logoutAction } from "@/app/admin/login/actions";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-5">
            <Link href="/admin" className="text-sm font-semibold text-zinc-900">
              问卷管理
            </Link>
            <Link href="/admin/diagnostics" className="text-sm text-zinc-600 hover:text-zinc-900">
              中文诊断
            </Link>
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-zinc-600 hover:text-zinc-900">
              退出
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
