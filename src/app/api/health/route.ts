import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "connected" | "error" = "error";
  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";
    } catch (error) {
      console.error("HEALTH_DATABASE_ERROR", error);
    }
  }

  return NextResponse.json({
    status: "ok",
    database,
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET)
    }
  });
}
