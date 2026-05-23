export const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
export const authUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL;

export function validateEnv() {
  const missing = [
    ...(!process.env.DATABASE_URL ? ["DATABASE_URL"] : []),
    ...(!authSecret ? ["NEXTAUTH_SECRET or AUTH_SECRET"] : []),
    ...(!authUrl ? ["NEXTAUTH_URL or AUTH_URL"] : [])
  ];
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    return { ok: false, missing };
  }
  return { ok: true, missing: [] as string[] };
}

export function validateAuthEnv() {
  const missing = [
    ...(!authSecret ? ["NEXTAUTH_SECRET or AUTH_SECRET"] : []),
    ...(!authUrl ? ["NEXTAUTH_URL or AUTH_URL"] : [])
  ];
  if (missing.length) {
    console.error(`Missing required NextAuth environment variables: ${missing.join(", ")}`);
    return { ok: false, missing };
  }
  if (process.env.NODE_ENV === "production" && authUrl?.includes("localhost")) {
    console.error("NEXTAUTH_URL or AUTH_URL must use the production Vercel URL in production.");
    return { ok: false, missing: ["NEXTAUTH_URL or AUTH_URL"] as string[] };
  }
  return { ok: true, missing: [] as string[] };
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function isDatabaseConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Can't reach database") || message.includes("ECONNREFUSED") || message.includes("DATABASE_URL") || message.includes("P1001");
}
