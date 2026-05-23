export const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "temporary-dev-secret";
export const authUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

export function validateEnv() {
  const missing = !process.env.DATABASE_URL ? ["DATABASE_URL"] : [];
  if (missing.length) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }
  warnAuthFallbacks();
  return { ok: true, missing };
}

export function warnAuthFallbacks() {
  if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
    console.warn("NEXTAUTH_SECRET/AUTH_SECRET missing. Using temporary fallback secret; set a stable secret in production.");
  }
  if (!process.env.NEXTAUTH_URL && !process.env.AUTH_URL && !process.env.NEXT_PUBLIC_APP_URL) {
    console.warn("NEXTAUTH_URL/AUTH_URL missing. Auth will infer request URL where possible.");
  }
  if (process.env.NODE_ENV === "production" && authUrl?.includes("localhost")) {
    console.warn("NEXTAUTH_URL/AUTH_URL appears to be localhost in production. Use your production Vercel URL.");
  }
}

export function validateAuthEnv() {
  warnAuthFallbacks();
  return { ok: true, missing: [] as string[] };
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function isDatabaseConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Can't reach database") || message.includes("ECONNREFUSED") || message.includes("DATABASE_URL") || message.includes("P1001");
}
