import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  if (isDemoMode()) {
    return (
      <DashboardShell superAdmin>
        <h1 className="text-3xl font-bold">Usage & System Settings</h1>
        <div className="mt-6 rounded-lg border bg-white p-4 shadow-soft">No AI usage yet in demo mode.</div>
      </DashboardShell>
    );
  }

  const logs = await prisma.aIUsageLog.findMany({ take: 50, orderBy: { createdAt: "desc" }, include: { business: true, user: true } });
  return (
    <DashboardShell superAdmin>
      <h1 className="text-3xl font-bold">Usage & System Settings</h1>
      <div className="mt-6 grid gap-3">
        {logs.length === 0 ? <div className="rounded-lg border bg-white p-4 shadow-soft">No AI usage yet.</div> : null}
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border bg-white p-4 shadow-soft">{log.feature} · {log.business?.name || "System"} · {log.createdAt.toDateString()}</div>
        ))}
      </div>
    </DashboardShell>
  );
}
