import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createQrDataUrl } from "@/lib/qr";
import { isDemoMode } from "@/lib/demo-data";

export async function POST(request: Request) {
  const form = await request.formData();
  const businessId = String(form.get("businessId") || "");
  const label = String(form.get("label") || "");
  const qrType = String(form.get("qrType") || "General feedback");
  const destinationUrl = String(form.get("destinationUrl") || "");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  if (isDemoMode()) {
    const dataUrl = await createQrDataUrl(destinationUrl);
    return NextResponse.json({
      qr: { id: `demo-qr-${Date.now()}`, businessId, label, qrType, destinationUrl, scanCount: 0, isActive: true },
      dataUrl,
      demoMode: true
    });
  }

  const qr = await prisma.qRCode.create({ data: { businessId, label, qrType, destinationUrl } });
  const dataUrl = await createQrDataUrl(destinationUrl);
  return NextResponse.json({ qr, dataUrl });
}
