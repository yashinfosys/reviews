import { NextResponse } from "next/server";
import { BusinessStatus, Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePaymentStatus, parsePlan, toDateOrNull } from "@/lib/super-admin-business";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

function numberOrUndefined(value: unknown) {
  if (value === "" || value == null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  await requireUser(undefined, [Role.SUPER_ADMIN]);
  const business = await prisma.business.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      users: { select: { id: true, name: true, email: true, mobile: true, role: true, isActive: true, mustChangePassword: true, createdAt: true } },
      subscription: true,
      settings: true,
      connections: true,
      qrCodes: { orderBy: { createdAt: "desc" }, take: 10 },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
      guestFeedback: { orderBy: { createdAt: "desc" }, take: 10 },
      complaintTickets: { orderBy: { createdAt: "desc" }, take: 10 },
      aiUsageLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { qrCodes: true, reviews: true, complaintTickets: true, guestFeedback: true } }
    }
  });
  if (!business) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const [qrScanAggregate, ratingAggregate, pendingComplaints] = await Promise.all([
    prisma.qRCode.aggregate({ where: { businessId: params.id }, _sum: { scanCount: true } }),
    prisma.review.aggregate({ where: { businessId: params.id, rating: { not: null } }, _avg: { rating: true } }),
    prisma.complaintTicket.count({ where: { businessId: params.id, status: { in: ["OPEN", "IN_PROGRESS"] } } })
  ]);

  return NextResponse.json({
    business,
    stats: {
      qrScans: qrScanAggregate._sum.scanCount || 0,
      averageRating: ratingAggregate._avg.rating || 0,
      pendingComplaints
    }
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const body = await request.json();
  const plan = body.plan ? parsePlan(body.plan) : undefined;

  const business = await prisma.business.update({
    where: { id: params.id },
    data: {
      name: body.name ? String(body.name).trim() : undefined,
      industryType: body.industryType ? String(body.industryType) : undefined,
      category: body.industryType ? String(body.industryType) : undefined,
      logoUrl: body.logoUrl === undefined ? undefined : String(body.logoUrl || "") || null,
      ownerName: body.ownerName === undefined ? undefined : String(body.ownerName || "") || null,
      ownerEmail: body.ownerEmail === undefined ? undefined : String(body.ownerEmail || "").toLowerCase().trim() || null,
      ownerMobile: body.ownerMobile === undefined ? undefined : String(body.ownerMobile || "") || null,
      whatsapp: body.whatsapp === undefined ? undefined : String(body.whatsapp || "") || null,
      address: body.address === undefined ? undefined : String(body.address || ""),
      city: body.city === undefined ? undefined : String(body.city || ""),
      state: body.state === undefined ? undefined : String(body.state || "") || null,
      country: body.country === undefined ? undefined : String(body.country || "India"),
      googleReviewLink: body.googleReviewLink === undefined ? undefined : String(body.googleReviewLink || "") || null,
      website: body.websiteUrl === undefined ? undefined : String(body.websiteUrl || "") || null,
      websiteUrl: body.websiteUrl === undefined ? undefined : String(body.websiteUrl || "") || null,
      status: body.status === "DISABLED" ? BusinessStatus.DISABLED : body.status === "ACTIVE" ? BusinessStatus.ACTIVE : undefined,
      subscription: plan || body.qrLimit !== undefined || body.aiUsageLimit !== undefined
        ? {
            upsert: {
              create: {
                plan: plan || "STARTER",
                qrLimit: numberOrUndefined(body.qrLimit) ?? 10,
                aiUsageLimit: numberOrUndefined(body.aiUsageLimit) ?? 1000,
                customQrLimit: numberOrUndefined(body.customQrLimit),
                isCustomLimitEnabled: Boolean(body.isCustomLimitEnabled),
                validFrom: toDateOrNull(body.validFrom),
                validTill: toDateOrNull(body.validTill),
                paymentStatus: parsePaymentStatus(body.paymentStatus)
              },
              update: {
                plan,
                qrLimit: numberOrUndefined(body.qrLimit),
                aiUsageLimit: numberOrUndefined(body.aiUsageLimit),
                customQrLimit: numberOrUndefined(body.customQrLimit) ?? null,
                isCustomLimitEnabled: body.isCustomLimitEnabled === undefined ? undefined : Boolean(body.isCustomLimitEnabled),
                validFrom: body.validFrom === undefined ? undefined : toDateOrNull(body.validFrom),
                validTill: body.validTill === undefined ? undefined : toDateOrNull(body.validTill),
                paymentStatus: body.paymentStatus === undefined ? undefined : parsePaymentStatus(body.paymentStatus)
              }
            }
          }
        : undefined
    },
    include: { subscription: true }
  });

  await writeAuditLog({ businessId: params.id, userId: user.id, action: "BUSINESS_UPDATED", entity: "Business", entityId: params.id });
  return NextResponse.json({ business });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const business = await prisma.business.update({
    where: { id: params.id },
    data: {
      deletedAt: new Date(),
      status: BusinessStatus.DISABLED,
      users: { updateMany: { where: { businessId: params.id }, data: { isActive: false } } }
    }
  });
  await writeAuditLog({ businessId: params.id, userId: user.id, action: "BUSINESS_SOFT_DELETED", entity: "Business", entityId: params.id });
  return NextResponse.json({ business });
}
