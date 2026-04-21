import { headers } from "next/headers";

/** 用于生成可分享的绝对链接（依赖反向代理头或环境变量） */
export async function getPublicOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (env) return env;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
