import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canCreateQrType, getAllowedQrLimit, qrLimitMessage } from "@/lib/subscription-limits";

function parseCsv(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [qrType = "ROOM", label = "", value = ""] = line.split(",").map((part) => part.trim());
      return { qrType, label: label || value || qrType, value };
    });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  const businessId = String(body.businessId || "");
  const csv = String(body.csv || "");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  if (user.businessId && user.businessId !== businessId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const business = await prisma.business.findUnique({ where: { id: businessId }, include: { subscription: true } });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (business.subscription?.plan === "STARTER") return NextResponse.json({ error: "Bulk QR generation is available on Pro and Enterprise." }, { status: 403 });

  const rows = parseCsv(csv);
  if (!rows.length) return NextResponse.json({ error: "CSV has no QR rows" }, { status: 400 });
  const locked = rows.find((row) => !canCreateQrType(business.subscription?.plan || "STARTER", row.qrType));
  if (locked) return NextResponse.json({ error: `${locked.qrType} is locked on your current plan.` }, { status: 403 });

  const activeCount = await prisma.qRCode.count({ where: { businessId, isActive: true } });
  const limit = getAllowedQrLimit(business.subscription);
  if (limit != null && activeCount + rows.length > limit) {
    return NextResponse.json({ error: qrLimitMessage(limit), limit, used: activeCount }, { status: 403 });
  }

  const created = [];
  for (const row of rows) {
    const qr = await prisma.qRCode.create({
      data: {
        businessId,
        qrType: row.qrType,
        label: row.label,
        roomNo: row.qrType === "ROOM" ? row.value || row.label : undefined,
        tableNo: row.qrType === "TABLE" ? row.value || row.label : undefined,
        destinationUrl: `/r/${business.slug}`
      }
    });
    const saved = await prisma.qRCode.update({ where: { id: qr.id }, data: { destinationUrl: `/r/${business.slug}/${qr.id}` } });
    created.push(saved);
  }

  return NextResponse.json({ created: created.length, printableUrl: "/admin/qr/print" });
}
