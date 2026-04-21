"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminPassword } from "@/lib/env";
import { adminSessionCookieName, createAdminSessionToken } from "@/lib/session";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (password !== getAdminPassword()) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await createAdminSessionToken();
  const store = await cookies();
  store.set(adminSessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next.startsWith("/") ? next : "/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(adminSessionCookieName);
  redirect("/admin/login");
}
