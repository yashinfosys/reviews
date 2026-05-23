import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { hasDatabaseUrl, validateAuthEnv } from "@/lib/env";

const handler = NextAuth(authOptions);

function authConfigError(request: Request) {
  const url = new URL("/auth/error", request.url);
  url.searchParams.set("error", !hasDatabaseUrl() ? "DatabaseMissing" : "Configuration");
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  if (new URL(request.url).pathname.endsWith("/error")) return authConfigError(request);
  const env = validateAuthEnv();
  if (!env.ok) return authConfigError(request);
  return handler(request as never);
}

export async function POST(request: Request) {
  const env = validateAuthEnv();
  if (!env.ok) return NextResponse.json({ error: "Authentication is not configured." }, { status: 500 });
  return handler(request as never);
}
