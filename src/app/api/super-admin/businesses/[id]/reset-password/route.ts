import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { generateTemporaryPassword } from "@/lib/super-admin-business";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const admin = await prisma.user.findFirst({ where: { businessId: id, role: Role.BUSINESS_ADMIN } });
  if (!admin) return NextResponse.json({ error: "Business admin not found." }, { status: 404 });

  const temporaryPassword = generateTemporaryPassword();
  const updated = await prisma.user.update({
    where: { id: admin.id },
    data: { password: await bcrypt.hash(temporaryPassword, 10), mustChangePassword: true, isActive: true },
    select: { id: true, name: true, email: true, role: true }
  });
  await writeAuditLog({ businessId: id, userId: user.id, action: "BUSINESS_ADMIN_PASSWORD_RESET", entity: "User", entityId: admin.id });

  return NextResponse.json({
    admin: updated,
    credentials: { loginUrl: "https://review.yashinfosystem.in/login", email: updated.email, temporaryPassword }
  });
}
