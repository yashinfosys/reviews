import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.count();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("DEBUG_USERS_COUNT_ERROR", error);
    return NextResponse.json({ users: 0 }, { status: 500 });
  }
}
