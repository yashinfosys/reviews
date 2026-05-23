import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const body = await request.json();
  const developerBranding = String(body.developerBranding || "Designed & Developed by Yash Infosystems").trim();
  if (isDemoMode()) return NextResponse.json({ ok: true, id: params.id, developerBranding, demoMode: true });

  const business = await prisma.business.update({ where: { id: params.id }, data: { developerBranding } });
  await writeAuditLog({ businessId: business.id, userId: user.id, action: "DEVELOPER_BRANDING_UPDATED", entity: "Business", entityId: business.id });
  return NextResponse.json({ business });
}
