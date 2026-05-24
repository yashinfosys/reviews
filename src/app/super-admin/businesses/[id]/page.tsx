import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { MetricCard } from "@/components/metric-card";
import { SuperBusinessActions } from "@/components/super-business-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessDetailPage({ params }: { params: { id: string } }) {
  const business = await prisma.business.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      users: { orderBy: { createdAt: "desc" } },
      subscription: true,
      settings: true,
      connections: true,
      guestFeedback: { orderBy: { createdAt: "desc" }, take: 8 },
      complaintTickets: { orderBy: { createdAt: "desc" }, take: 8 },
      aiUsageLogs: { orderBy: { createdAt: "desc" }, take: 8 },
      _count: { select: { reviews: true, qrCodes: true, complaintTickets: true, guestFeedback: true } }
    }
  });
  if (!business) notFound();

  const [qrScans, avgRating, recentReviews] = await Promise.all([
    prisma.qRCode.aggregate({ where: { businessId: business.id }, _sum: { scanCount: true, reviewCount: true, complaintCount: true, conversionCount: true } }),
    prisma.review.aggregate({ where: { businessId: business.id, rating: { not: null } }, _avg: { rating: true } }),
    prisma.review.findMany({ where: { businessId: business.id }, orderBy: { createdAt: "desc" }, take: 8 })
  ]);

  return (
    <DashboardShell superAdmin>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/super-admin/businesses" className="text-sm font-semibold text-primary hover:underline">Back to businesses</Link>
          <h1 className="mt-2 text-3xl font-bold">{business.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{business.industryType} · {business.city} · {business.status}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="QR scans" value={qrScans._sum.scanCount || 0} />
        <MetricCard label="Reviews" value={business._count.reviews} />
        <MetricCard label="Average rating" value={(avgRating._avg.rating || 0).toFixed(1)} />
        <MetricCard label="Complaints" value={business._count.complaintTickets} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Profile details</h2>
          <div className="mt-4 grid gap-2 text-sm text-slate-700">
            <div><strong>Slug:</strong> {business.slug}</div>
            <div><strong>Owner:</strong> {business.ownerName || "-"} · {business.ownerEmail || "-"}</div>
            <div><strong>Mobile:</strong> {business.ownerMobile || "-"}</div>
            <div><strong>Address:</strong> {[business.address, business.city, business.state, business.country].filter(Boolean).join(", ")}</div>
            <div><strong>Website:</strong> {business.websiteUrl || business.website || "-"}</div>
            <div><strong>Google review:</strong> {business.googleReviewLink || "-"}</div>
          </div>
          <SuperBusinessActions businessId={business.id} customQrLimit={business.subscription?.customQrLimit} isCustomLimitEnabled={business.subscription?.isCustomLimitEnabled} />
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Subscription</h2>
          <div className="mt-4 grid gap-2 text-sm text-slate-700">
            <div><strong>Plan:</strong> {business.subscription?.plan || "STARTER"}</div>
            <div><strong>Payment:</strong> {business.subscription?.paymentStatus || "TRIAL"}</div>
            <div><strong>QR limit:</strong> {business.subscription?.qrLimit ?? 10}</div>
            <div><strong>Custom QR limit:</strong> {business.subscription?.isCustomLimitEnabled ? business.subscription.customQrLimit : "Off"}</div>
            <div><strong>AI usage limit:</strong> {business.subscription?.aiUsageLimit ?? 1000}</div>
            <div><strong>Valid till:</strong> {business.subscription?.validTill?.toLocaleDateString() || "-"}</div>
          </div>
        </section>

        <DetailList title="Admin users" items={business.users.map((user) => `${user.name} · ${user.email} · ${user.role} · ${user.isActive ? "Active" : "Inactive"}`)} />
        <DetailList title="Platform connections" items={business.connections.map((item) => `${item.platform} · ${item.status}`)} />
        <DetailList title="Recent feedback" items={business.guestFeedback.map((item) => `${item.guestName} · ${item.rating}/5 · ${item.feedbackText}`)} />
        <DetailList title="Recent reviews" items={recentReviews.map((item) => `${item.platform} · ${item.rating || "-"} · ${item.reviewText}`)} />
        <DetailList title="Recent complaints" items={business.complaintTickets.map((item) => `${item.status} · ${item.priority} · ${item.reviewText}`)} />
        <DetailList title="AI usage logs" items={business.aiUsageLogs.map((item) => `${item.feature} · ${item.promptTokens + item.completionTokens} tokens`)} />
      </div>
    </DashboardShell>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 grid gap-2">
        {items.map((item, index) => <div key={`${title}-${index}`} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{item}</div>)}
        {!items.length ? <p className="text-sm text-slate-500">No data yet.</p> : null}
      </div>
    </section>
  );
}
