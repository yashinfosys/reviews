const requiredEnv = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;

export function validateEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    return { ok: false, missing };
  }
  return { ok: true, missing: [] as string[] };
}

export function isDatabaseConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Can't reach database") || message.includes("ECONNREFUSED") || message.includes("DATABASE_URL") || message.includes("P1001");
}
