import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const setupSecret = process.env.SETUP_SECRET;
  const providedSecret =
    request.headers.get("x-setup-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!setupSecret) {
    return NextResponse.json({ error: "SETUP_SECRET is not configured." }, { status: 500 });
  }

  if (!providedSecret || providedSecret !== setupSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const email = "superadmin@yashinfosystems.com";
    const password = await bcrypt.hash("Admin@123", 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: "Super Admin",
        password,
        role: Role.SUPER_ADMIN,
        businessId: null,
        isActive: true
      },
      create: {
        name: "Super Admin",
        email,
        password,
        role: Role.SUPER_ADMIN,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("SETUP_SEED_ADMIN_ERROR", error);
    return NextResponse.json(
      { error: "Database tables are not migrated. Please run migration." },
      { status: 500 }
    );
  }
}
