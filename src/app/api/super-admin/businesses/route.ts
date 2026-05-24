import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BusinessStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  generateTemporaryPassword,
  parsePaymentStatus,
  parsePlan,
  PLAN_LIMITS,
  resolveUniqueBusinessSlug,
  sendWelcomeEmail,
  slugify,
  toDateOrNull
} from "@/lib/super-admin-business";

export const dynamic = "force-dynamic";

function numberOrDefault(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  await requireUser(undefined, [Role.SUPER_ADMIN]);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const plan = searchParams.get("plan");
  const industryType = searchParams.get("industryType");
  const city = searchParams.get("city");

  const businesses = await prisma.business.findMany({
    where: {
      deletedAt: null,
      ...(status && status !== "ALL" ? { status: status as BusinessStatus } : {}),
      ...(industryType && industryType !== "ALL" ? { industryType } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(plan && plan !== "ALL" ? { subscription: { plan: plan as never } } : {})
    },
    include: {
      users: { where: { role: Role.BUSINESS_ADMIN }, select: { id: true, name: true, email: true, mobile: true, isActive: true }, take: 1 },
      subscription: true,
      _count: { select: { reviews: true, complaintTickets: true, qrCodes: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const ids = businesses.map((business) => business.id);
  const [qrStats, reviewStats] = await Promise.all([
    prisma.qRCode.groupBy({
      by: ["businessId"],
      where: { businessId: { in: ids } },
      _sum: { scanCount: true }
    }),
    prisma.review.groupBy({
      by: ["businessId"],
      where: { businessId: { in: ids }, rating: { not: null } },
      _avg: { rating: true }
    })
  ]);
  const scansByBusiness = new Map(qrStats.map((item) => [item.businessId, item._sum.scanCount || 0]));
  const ratingByBusiness = new Map(reviewStats.map((item) => [item.businessId, item._avg.rating || 0]));

  return NextResponse.json({
    businesses: businesses.map((business) => ({
      ...business,
      admin: business.users[0] || null,
      qrScans: scansByBusiness.get(business.id) || 0,
      averageRating: ratingByBusiness.get(business.id) || 0
    }))
  });
}

export async function POST(request: Request) {
  const superAdmin = await requireUser(undefined, [Role.SUPER_ADMIN]);
  const body = await request.json();
  const name = String(body.businessName || body.name || "").trim();
  const adminEmail = String(body.adminEmail || "").toLowerCase().trim();
  const adminName = String(body.adminName || "Business Admin").trim();

  if (!name || !adminEmail) {
    return NextResponse.json({ error: "Business name and admin email are required." }, { status: 400 });
  }

  const plan = parsePlan(body.plan);
  const defaults = PLAN_LIMITS[plan];
  const temporaryPassword = String(body.temporaryPassword || generateTemporaryPassword());
  const slug = await resolveUniqueBusinessSlug(String(body.slug || name), async (candidate) =>
    Boolean(await prisma.business.findUnique({ where: { slug: candidate }, select: { id: true } }))
  );
  const email = adminEmail.toLowerCase();

  const result = await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name,
        slug,
        category: String(body.industryType || "Other"),
        industryType: String(body.industryType || "Other"),
        logoUrl: String(body.logoUrl || "") || null,
        ownerName: String(body.ownerName || "") || null,
        ownerEmail: String(body.ownerEmail || "").toLowerCase().trim() || null,
        ownerMobile: String(body.ownerMobile || "") || null,
        phone: String(body.ownerMobile || "") || null,
        whatsapp: String(body.whatsapp || "") || null,
        address: String(body.address || ""),
        city: String(body.city || ""),
        state: String(body.state || "") || null,
        country: String(body.country || "India"),
        googleReviewLink: String(body.googleReviewLink || "") || null,
        website: String(body.websiteUrl || "") || null,
        websiteUrl: String(body.websiteUrl || "") || null,
        status: body.status === "DISABLED" ? BusinessStatus.DISABLED : BusinessStatus.ACTIVE,
        settings: { create: {} },
        subscription: {
          create: {
            plan,
            qrLimit: numberOrDefault(body.qrLimit, defaults.qrLimit),
            customQrLimit: body.customQrLimit === "" || body.customQrLimit == null ? null : numberOrDefault(body.customQrLimit, defaults.qrLimit),
            isCustomLimitEnabled: Boolean(body.isCustomLimitEnabled),
            aiUsageLimit: numberOrDefault(body.aiUsageLimit, defaults.aiUsageLimit),
            validFrom: toDateOrNull(body.validFrom),
            validTill: toDateOrNull(body.validTill),
            paymentStatus: parsePaymentStatus(body.paymentStatus)
          }
        }
      },
      include: { subscription: true }
    });

    const admin = await tx.user.upsert({
      where: { email },
      update: {
        name: adminName,
        mobile: String(body.adminMobile || "") || null,
        password: await bcrypt.hash(temporaryPassword, 10),
        role: Role.BUSINESS_ADMIN,
        businessId: business.id,
        isActive: business.status === BusinessStatus.ACTIVE,
        mustChangePassword: true
      },
      create: {
        name: adminName,
        email,
        mobile: String(body.adminMobile || "") || null,
        password: await bcrypt.hash(temporaryPassword, 10),
        role: Role.BUSINESS_ADMIN,
        businessId: business.id,
        isActive: business.status === BusinessStatus.ACTIVE,
        mustChangePassword: true
      },
      select: { id: true, name: true, email: true, mobile: true, role: true, businessId: true }
    });

    await tx.auditLog.create({
      data: {
        businessId: business.id,
        userId: superAdmin.id,
        action: "BUSINESS_CREATED",
        entity: "Business",
        entityId: business.id,
        metadata: { adminEmail: admin.email, plan }
      }
    });

    return { business, admin };
  });

  const emailResult = await sendWelcomeEmail({ adminName: result.admin.name, adminEmail: result.admin.email, temporaryPassword }).catch((error) => {
    console.error("WELCOME_EMAIL_ERROR", error);
    return {
      sent: false,
      message: "Business created. Email not sent because SMTP delivery failed."
    };
  });

  return NextResponse.json({
    ok: true,
    business: result.business,
    admin: result.admin,
    credentials: {
      loginUrl: "https://review.yashinfosystem.in/login",
      email: result.admin.email,
      temporaryPassword
    },
    email: emailResult
  });
}
