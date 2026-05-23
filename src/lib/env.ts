const requiredEnv = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;
const requiredAuthEnv = ["NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;

export function validateEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    return { ok: false, missing };
  }
  return { ok: true, missing: [] as string[] };
}

export function validateAuthEnv() {
  const missing = requiredAuthEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing required NextAuth environment variables: ${missing.join(", ")}`);
    return { ok: false, missing };
  }
  if (process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL?.includes("localhost")) {
    console.error("NEXTAUTH_URL must use the production Vercel URL in production.");
    return { ok: false, missing: ["NEXTAUTH_URL"] as string[] };
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
