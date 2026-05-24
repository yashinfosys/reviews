import { NextResponse } from "next/server";
import { BusinessStatus, Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const business = await prisma.business.update({
    where: { id: params.id },
    data: {
      status: BusinessStatus.ACTIVE,
      users: { updateMany: { where: { role: Role.BUSINESS_ADMIN }, data: { isActive: true } } }
    }
  });
  await writeAuditLog({ businessId: params.id, userId: user.id, action: "BUSINESS_ENABLED", entity: "Business", entityId: params.id });
  return NextResponse.json({ business });
}
