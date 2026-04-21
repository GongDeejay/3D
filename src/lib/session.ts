import { SignJWT, jwtVerify } from "jose";

import { getSessionSecret } from "@/lib/env";

const COOKIE = "si_admin_session";

function getSecretKey(): Uint8Array {
  const s = getSessionSecret();
  return new TextEncoder().encode(s);
}

export async function createAdminSessionToken(): Promise<string> {
  const key = getSecretKey();
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export const adminSessionCookieName = COOKIE;
