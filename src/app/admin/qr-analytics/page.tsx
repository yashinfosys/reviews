import { DashboardShell } from "@/components/dashboard-shell";
import { MetricCard } from "@/components/metric-card";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { QR_TYPE_LABELS, QR_TYPES } from "@/lib/subscription-limits";

export const dynamic = "force-dynamic";

const platforms = ["GOOGLE", "ZOMATO", "SWIGGY", "BOOKING", "MAKEMYTRIP", "GOIBIBO", "AGODA", "TRIPADVISOR", "AIRBNB"];

type QRAnalyticsSearchParams = { from?: string; locationId?: string; qrType?: string; platform?: string };

export default async function QRAnalyticsPage({ searchParams }: { searchParams: Promise<QRAnalyticsSearchParams> }) {
  const filters = await searchParams;
  const user = await getCurrentUser();
  const businessFilter = user?.businessId ? { businessId: user.businessId } : {};
  const createdAt = filters.from ? { gte: new Date(filters.from) } : undefined;
  const qrWhere = {
    ...businessFilter,
    ...(filters.locationId ? { locationId: filters.locationId } : {}),
    ...(filters.qrType ? { qrType: filters.qrType } : {})
  };
  const feedbackWhere = {
    ...businessFilter,
    ...(createdAt ? { createdAt } : {}),
    ...(filters.platform ? { platformClicked: filters.platform as never } : {}),
    qrCodeId: { not: null }
  };
  const [qrCodes, feedback, complaints, locations] = await Promise.all([
    prisma.qRCode.findMany({ where: qrWhere, include: { location: true }, orderBy: { createdAt: "desc" } }),
    prisma.guestFeedback.findMany({ where: feedbackWhere }),
    prisma.complaintTicket.count({ where: { ...businessFilter, ...(createdAt ? { createdAt } : {}) } }),
    prisma.location.findMany({ where: businessFilter })
  ]);
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0);
  const totalFeedback = feedback.length;
  const googleClicks = feedback.filter((item) => item.platformClicked === "GOOGLE").length;
  const otaClicks = feedback.filter((item) => item.platformClicked && item.platformClicked !== "GOOGLE").length;
  const conversionRate = totalScans ? `${Math.round((totalFeedback / totalScans) * 100)}%` : "0%";

  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">QR Analytics</h1>
      <form className="mt-5 grid gap-3 rounded-lg border bg-white p-4 shadow-soft md:grid-cols-4">
        <input type="date" name="from" defaultValue={filters.from || ""} className="h-10 rounded-md border px-3 text-sm" />
        <select name="locationId" defaultValue={filters.locationId || ""} className="h-10 rounded-md border bg-white px-3 text-sm">
          <option value="">All locations</option>
          {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
        </select>
        <select name="qrType" defaultValue={filters.qrType || ""} className="h-10 rounded-md border bg-white px-3 text-sm">
          <option value="">All QR types</option>
          {QR_TYPES.map((type) => <option key={type} value={type}>{QR_TYPE_LABELS[type]}</option>)}
        </select>
        <select name="platform" defaultValue={filters.platform || ""} className="h-10 rounded-md border bg-white px-3 text-sm">
          <option value="">All platforms</option>
          {platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
        </select>
        <button className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white md:col-span-4">Apply filters</button>
      </form>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Total scans" value={totalScans} />
        <MetricCard label="Total feedback" value={totalFeedback} />
        <MetricCard label="Google clicks" value={googleClicks} />
        <MetricCard label="OTA clicks" value={otaClicks} />
        <MetricCard label="Complaints" value={complaints} />
        <MetricCard label="Conversion rate" value={conversionRate} />
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border bg-white shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">QR</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Scans</th>
              <th className="px-4 py-3">Reviews</th>
              <th className="px-4 py-3">Complaints</th>
              <th className="px-4 py-3">Conversions</th>
            </tr>
          </thead>
          <tbody>
            {qrCodes.map((qr) => (
              <tr key={qr.id} className="border-t">
                <td className="px-4 py-3 font-medium">{qr.label}</td>
                <td className="px-4 py-3">{QR_TYPE_LABELS[qr.qrType] || qr.qrType}</td>
                <td className="px-4 py-3">{qr.location?.name || "Default"}</td>
                <td className="px-4 py-3">{qr.scanCount}</td>
                <td className="px-4 py-3">{qr.reviewCount}</td>
                <td className="px-4 py-3">{qr.complaintCount}</td>
                <td className="px-4 py-3">{qr.conversionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
