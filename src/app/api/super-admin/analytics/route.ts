import { NextResponse } from "next/server";
import { BusinessStatus, ComplaintStatus, Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireUser(undefined, [Role.SUPER_ADMIN]);
  const [totalBusinesses, activeBusinesses, disabledBusinesses, qrScans, totalReviews, avgRating, complaints, pendingComplaints, aiUsage] = await Promise.all([
    prisma.business.count({ where: { deletedAt: null } }),
    prisma.business.count({ where: { deletedAt: null, status: BusinessStatus.ACTIVE } }),
    prisma.business.count({ where: { deletedAt: null, status: BusinessStatus.DISABLED } }),
    prisma.qRCode.aggregate({ _sum: { scanCount: true } }),
    prisma.review.count(),
    prisma.review.aggregate({ where: { rating: { not: null } }, _avg: { rating: true } }),
    prisma.complaintTicket.count(),
    prisma.complaintTicket.count({ where: { status: { in: [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS] } } }),
    prisma.aIUsageLog.count()
  ]);

  return NextResponse.json({
    cards: {
      totalBusinesses,
      activeBusinesses,
      disabledBusinesses,
      totalQrScans: qrScans._sum.scanCount || 0,
      totalReviews,
      averageRating: avgRating._avg.rating || 0,
      totalComplaints: complaints,
      pendingComplaints,
      aiUsageCount: aiUsage,
      monthlyRevenue: 0
    }
  });
}
