import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const admin = await prisma.user.findFirst({
    where: { businessId: params.id, role: Role.BUSINESS_ADMIN, isActive: true },
    select: { id: true, email: true, name: true, businessId: true }
  });
  if (!admin) return NextResponse.json({ error: "Active business admin not found." }, { status: 404 });

  await writeAuditLog({
    businessId: params.id,
    userId: user.id,
    action: "SUPER_ADMIN_ACCESSED_ADMIN_ACCOUNT",
    entity: "User",
    entityId: admin.id,
    metadata: { adminEmail: admin.email }
  });

  return NextResponse.json({ ok: true, admin, adminUrl: "/admin" });
}
