import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const body = await request.json();
  const isCustomLimitEnabled = Boolean(body.isCustomLimitEnabled);
  const customQrLimit = body.customQrLimit === "" || body.customQrLimit == null ? null : Number(body.customQrLimit);
  if (customQrLimit != null && (!Number.isFinite(customQrLimit) || customQrLimit < 0)) {
    return NextResponse.json({ error: "Invalid custom QR limit" }, { status: 400 });
  }
  if (isDemoMode()) return NextResponse.json({ ok: true, demoMode: true });

  const subscription = await prisma.subscription.upsert({
    where: { businessId: id },
    update: { isCustomLimitEnabled, customQrLimit },
    create: { businessId: id, isCustomLimitEnabled, customQrLimit }
  });
  await writeAuditLog({
    businessId: id,
    userId: user.id,
    action: "CUSTOM_QR_LIMIT_UPDATED",
    entity: "Subscription",
    entityId: subscription.id,
    metadata: { isCustomLimitEnabled, customQrLimit }
  });
  return NextResponse.json({ subscription });
}
