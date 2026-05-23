import { DashboardShell } from "@/components/dashboard-shell";
import { MetricCard } from "@/components/metric-card";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { prisma } from "@/lib/prisma";
import { isDatabaseConnectionError } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  try {
    const [businesses, users, usage, qrCodes] = await Promise.all([
      prisma.business.count(),
      prisma.user.count(),
      prisma.aIUsageLog.count(),
      prisma.qRCode.count()
    ]);
    return (
      <DashboardShell superAdmin>
        <h1 className="text-3xl font-bold">Super Admin</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Businesses" value={businesses} />
          <MetricCard label="Users" value={users} />
          <MetricCard label="AI usage logs" value={usage} />
          <MetricCard label="QR codes" value={qrCodes} />
        </div>
      </DashboardShell>
    );
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error;
    return <DashboardShell superAdmin><h1 className="text-3xl font-bold">Super Admin</h1><DatabaseUnavailable /></DashboardShell>;
  }
}
