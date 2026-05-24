import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authSecret, authUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "connected" | "error" = "error";
  let userTable: "exists" | "missing" | "unknown" = "unknown";
  let users = 0;

  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";

      const tableResult = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'User'
        ) AS "exists"
      `;
      userTable = tableResult[0]?.exists ? "exists" : "missing";

      if (userTable === "exists") {
        users = await prisma.user.count();
      }
    } catch (error) {
      console.error("HEALTH_DATABASE_ERROR", error);
    }
  }

  return NextResponse.json({
    status: "ok",
    database,
    userTable,
    users,
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasNextAuthSecret: Boolean(authSecret),
      hasNextAuthUrl: Boolean(authUrl),
      hasSetupSecret: Boolean(process.env.SETUP_SECRET)
    }
  });
}
