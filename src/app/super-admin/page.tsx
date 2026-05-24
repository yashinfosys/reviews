import { BusinessStatus, ComplaintStatus } from "@prisma/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { MetricCard } from "@/components/metric-card";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { prisma } from "@/lib/prisma";
import { isDatabaseConnectionError } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  try {
    const [totalBusinesses, activeBusinesses, disabledBusinesses, qrScans, totalReviews, avgRating, totalComplaints, pendingComplaints, aiUsage, businesses] = await Promise.all([
      prisma.business.count({ where: { deletedAt: null } }),
      prisma.business.count({ where: { deletedAt: null, status: BusinessStatus.ACTIVE } }),
      prisma.business.count({ where: { deletedAt: null, status: BusinessStatus.DISABLED } }),
      prisma.qRCode.aggregate({ _sum: { scanCount: true } }),
      prisma.review.count(),
      prisma.review.aggregate({ where: { rating: { not: null } }, _avg: { rating: true } }),
      prisma.complaintTicket.count(),
      prisma.complaintTicket.count({ where: { status: { in: [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS] } } }),
      prisma.aIUsageLog.count(),
      prisma.business.findMany({
        where: { deletedAt: null },
        include: {
          subscription: true,
          _count: { select: { reviews: true, complaintTickets: true, qrCodes: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 20
      })
    ]);

    const enriched = await Promise.all(businesses.map(async (business) => {
      const [scans, rating] = await Promise.all([
        prisma.qRCode.aggregate({ where: { businessId: business.id }, _sum: { scanCount: true, reviewCount: true, complaintCount: true, conversionCount: true } }),
        prisma.review.aggregate({ where: { businessId: business.id, rating: { not: null } }, _avg: { rating: true } })
      ]);
      return {
        business,
        qrScans: scans._sum.scanCount || 0,
        reviews: business._count.reviews,
        complaints: business._count.complaintTickets,
        averageRating: rating._avg.rating || 0,
        googleClicks: scans._sum.reviewCount || 0,
        otaClicks: scans._sum.conversionCount || 0
      };
    }));

    const topByScans = [...enriched].sort((a, b) => b.qrScans - a.qrScans).slice(0, 5);
    const topByReviews = [...enriched].sort((a, b) => b.reviews - a.reviews).slice(0, 5);
    const topByRating = [...enriched].sort((a, b) => b.averageRating - a.averageRating).slice(0, 5);
    const topByComplaints = [...enriched].sort((a, b) => b.complaints - a.complaints).slice(0, 5);

    return (
      <DashboardShell superAdmin>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Super Admin Overview</h1>
            <p className="mt-1 text-sm text-slate-500">Global property, review, complaint, and QR performance.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total Businesses" value={totalBusinesses} />
          <MetricCard label="Active Businesses" value={activeBusinesses} />
          <MetricCard label="Disabled Businesses" value={disabledBusinesses} />
          <MetricCard label="Total QR Scans" value={qrScans._sum.scanCount || 0} />
          <MetricCard label="Total Reviews" value={totalReviews} />
          <MetricCard label="Average Rating" value={(avgRating._avg.rating || 0).toFixed(1)} />
          <MetricCard label="Total Complaints" value={totalComplaints} />
          <MetricCard label="Pending Complaints" value={pendingComplaints} />
          <MetricCard label="AI Usage Count" value={aiUsage} />
          <MetricCard label="Monthly Revenue" value="--" note="Payment integration placeholder" />
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          <TopProperties title="Top 5 by QR scans" items={topByScans} />
          <TopProperties title="Top 5 by total reviews" items={topByReviews} />
          <TopProperties title="Top 5 by average rating" items={topByRating} />
          <TopProperties title="Top 5 by complaints" items={topByComplaints} />
        </div>
      </DashboardShell>
    );
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error;
    return <DashboardShell superAdmin><h1 className="text-3xl font-bold">Super Admin</h1><DatabaseUnavailable /></DashboardShell>;
  }
}

function TopProperties({ title, items }: { title: string; items: Array<{ business: { name: string; city: string; status: string; subscription?: { plan: string } | null }; qrScans: number; averageRating: number; reviews: number; complaints: number; googleClicks: number; otaClicks: number }> }) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={`${title}-${item.business.name}`} className="rounded-md border bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-950">{item.business.name}</div>
                <div className="text-sm text-slate-500">{item.business.city || "No city"} · {item.business.subscription?.plan || "STARTER"} · {item.business.status}</div>
              </div>
              <div className="text-right text-sm text-slate-600">
                <div>{item.qrScans} scans</div>
                <div>{item.averageRating.toFixed(1)} avg</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-slate-600">
              <span>{item.reviews} reviews</span>
              <span>{item.complaints} complaints</span>
              <span>{item.googleClicks} Google</span>
              <span>{item.otaClicks} OTA</span>
            </div>
          </div>
        ))}
        {!items.length ? <p className="text-sm text-slate-500">No properties yet.</p> : null}
      </div>
    </section>
  );
}
