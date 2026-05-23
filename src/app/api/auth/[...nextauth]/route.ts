import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { validateAuthEnv } from "@/lib/env";

const handler = NextAuth(authOptions);

export async function GET(request: Request) {
  validateAuthEnv();
  return handler(request as never);
}

export async function POST(request: Request) {
  validateAuthEnv();
  return handler(request as never);
}
