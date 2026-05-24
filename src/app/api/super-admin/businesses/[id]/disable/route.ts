import { NextResponse } from "next/server";
import { BusinessStatus, Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const business = await prisma.business.update({
    where: { id },
    data: {
      status: BusinessStatus.DISABLED,
      users: { updateMany: { where: { role: Role.BUSINESS_ADMIN }, data: { isActive: false } } }
    }
  });
  await writeAuditLog({ businessId: id, userId: user.id, action: "BUSINESS_DISABLED", entity: "Business", entityId: id });
  return NextResponse.json({ business });
}
