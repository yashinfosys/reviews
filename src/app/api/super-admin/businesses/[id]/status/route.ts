import { NextResponse } from "next/server";
import { BusinessStatus, Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const body = await request.json();
  const status = body.status === "DISABLED" ? BusinessStatus.DISABLED : BusinessStatus.ACTIVE;
  if (isDemoMode()) return NextResponse.json({ ok: true, id: params.id, status, demoMode: true });

  const business = await prisma.business.update({
    where: { id: params.id },
    data: {
      status,
      users: { updateMany: { where: { role: Role.BUSINESS_ADMIN }, data: { isActive: status === BusinessStatus.ACTIVE } } }
    }
  });
  await writeAuditLog({ businessId: business.id, userId: user.id, action: "BUSINESS_STATUS_UPDATED", entity: "Business", entityId: business.id, metadata: { status } });
  return NextResponse.json({ business });
}
