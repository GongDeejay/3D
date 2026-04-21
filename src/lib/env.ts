function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function getAdminPassword(): string {
  return required("ADMIN_PASSWORD");
}

export function getSessionSecret(): string {
  return required("SESSION_SECRET");
}
