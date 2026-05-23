import { NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createQrDataUrl } from "@/lib/qr";
import { isDemoMode } from "@/lib/demo-data";
import { requireUser } from "@/lib/auth";
import { canCreateQrType, getAllowedQrLimit, qrLimitMessage } from "@/lib/subscription-limits";

export async function POST(request: Request) {
  const user = await requireUser();
  const form = await request.formData();
  const businessId = String(form.get("businessId") || "");
  const label = String(form.get("label") || "");
  const qrType = String(form.get("qrType") || "GENERAL_FEEDBACK");
  const locationId = String(form.get("locationId") || "") || undefined;
  const roomNo = String(form.get("roomNo") || "") || undefined;
  const tableNo = String(form.get("tableNo") || "") || undefined;
  const eventName = String(form.get("eventName") || "") || undefined;
  const staffId = String(form.get("staffId") || "") || undefined;
  const platformValue = String(form.get("platformTarget") || "");
  const platformTarget = platformValue && platformValue in Platform ? (platformValue as Platform) : undefined;
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  if (user.businessId && user.businessId !== businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (isDemoMode()) {
    const destinationUrl = `/r/demo-hotel/demo-qr-${Date.now()}`;
    const dataUrl = await createQrDataUrl(destinationUrl);
    return NextResponse.json({
      qr: { id: `demo-qr-${Date.now()}`, businessId, label, qrType, destinationUrl, scanCount: 0, reviewCount: 0, complaintCount: 0, conversionCount: 0, isActive: true },
      dataUrl,
      demoMode: true
    });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId }, include: { subscription: true } });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const plan = business.subscription?.plan || "STARTER";
  if (!canCreateQrType(plan, qrType)) {
    return NextResponse.json({ error: `${qrType.replaceAll("_", " ")} is locked on your current plan.` }, { status: 403 });
  }

  const [activeCount, limit] = await Promise.all([
    prisma.qRCode.count({ where: { businessId, isActive: true } }),
    Promise.resolve(getAllowedQrLimit(business.subscription))
  ]);
  if (limit != null && activeCount >= limit) {
    return NextResponse.json({ error: qrLimitMessage(limit), limit, used: activeCount }, { status: 403 });
  }

  const qr = await prisma.qRCode.create({
    data: {
      businessId,
      locationId,
      label,
      qrType,
      roomNo,
      tableNo,
      eventName,
      staffId,
      platformTarget,
      destinationUrl: `/r/${business.slug}`
    }
  });
  const destinationUrl = `/r/${business.slug}/${qr.id}`;
  const saved = await prisma.qRCode.update({ where: { id: qr.id }, data: { destinationUrl } });
  const dataUrl = await createQrDataUrl(destinationUrl);
  return NextResponse.json({ qr: saved, dataUrl });
}
