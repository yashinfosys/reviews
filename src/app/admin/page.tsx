import { DashboardShell } from "@/components/dashboard-shell";
import { MetricCard } from "@/components/metric-card";
import { AnalyticsPanel } from "@/components/analytics-panel";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { isDatabaseConnectionError } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    const user = await getCurrentUser();
    const businessFilter = user?.businessId ? { businessId: user.businessId } : {};
    const [reviews, tickets, feedback, qrCodes] = await Promise.all([
      prisma.review.findMany({ where: businessFilter }),
      prisma.complaintTicket.findMany({ where: businessFilter }),
      prisma.guestFeedback.findMany({ where: businessFilter }),
      prisma.qRCode.findMany({ where: businessFilter })
    ]);
    const [googleConnection, aiUsage] = await Promise.all([
      prisma.platformConnection.findFirst({ where: { ...businessFilter, platform: "GOOGLE", isActive: true } }),
      prisma.aIUsageLog.count({ where: businessFilter })
    ]);
    const ratingCount = reviews.filter((item) => item.rating).length;
    const avg = ratingCount ? (reviews.reduce((sum, item) => sum + (item.rating || 0), 0) / ratingCount).toFixed(1) : "0";
    const platformData = Object.values(
      reviews.reduce<Record<string, { platform: string; count: number; ratingSum: number; ratingCount: number }>>((acc, review) => {
        const key = review.platform;
        acc[key] ||= { platform: key, count: 0, ratingSum: 0, ratingCount: 0 };
        acc[key].count += 1;
        if (review.rating) {
          acc[key].ratingSum += review.rating;
          acc[key].ratingCount += 1;
        }
        return acc;
      }, {})
    ).map((item) => ({ platform: item.platform, count: item.count, rating: item.ratingCount ? item.ratingSum / item.ratingCount : 0 }));
    return (
      <DashboardShell>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total reviews" value={reviews.length} />
          <MetricCard label="Average rating" value={avg} />
          <MetricCard label="Pending replies" value={reviews.filter((item) => item.status === "PENDING_REPLY").length} />
          <MetricCard label="Google connected" value={googleConnection ? "Yes" : "No"} />
          <MetricCard label="Complaint tickets" value={tickets.length} />
          <MetricCard label="QR scans" value={qrCodes.reduce((sum, item) => sum + item.scanCount, 0)} />
          <MetricCard label="AI usage" value={aiUsage} />
          <MetricCard label="Negative feedback" value={reviews.filter((item) => item.sentiment === "negative" || (item.rating || 5) <= 3).length} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <MetricCard label="Guest feedback" value={feedback.length} note="All ratings are stored honestly." />
          <MetricCard label="Google reply safety" value="Approval" note="Admin approval required before Google posting." />
        </div>
        <div className="mt-6">
          <AnalyticsPanel data={platformData.length ? platformData : [{ platform: "No reviews yet", count: 0, rating: 0 }]} />
        </div>
      </DashboardShell>
    );
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error;
    return <DashboardShell><h1 className="text-3xl font-bold">Admin Dashboard</h1><DatabaseUnavailable /></DashboardShell>;
  }
}
