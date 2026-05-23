import { DashboardShell } from "@/components/dashboard-shell";
import { MetricCard } from "@/components/metric-card";
import { prisma } from "@/lib/prisma";
import { demoQrCodes, demoUsers, isDemoMode } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  if (isDemoMode()) {
    return (
      <DashboardShell superAdmin>
        <h1 className="text-3xl font-bold">Super Admin</h1>
        <div className="mt-3 rounded-md border bg-amber-50 p-3 text-sm text-amber-900">Demo mode is active because no DATABASE_URL is configured.</div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Businesses" value={1} />
          <MetricCard label="Users" value={demoUsers.length} />
          <MetricCard label="AI usage logs" value={0} />
          <MetricCard label="QR codes" value={demoQrCodes.length} />
        </div>
      </DashboardShell>
    );
  }

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
}
