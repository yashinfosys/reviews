import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({ include: { business: true }, orderBy: { createdAt: "desc" } });
  return (
    <DashboardShell superAdmin>
      <h1 className="text-3xl font-bold">Subscriptions</h1>
      <div className="mt-6 grid gap-3">
        {subscriptions.map((item) => <div key={item.id} className="rounded-lg border bg-white p-4 shadow-soft"><div className="font-semibold">{item.business.name}</div><div className="mt-1 text-sm text-slate-500">{item.plan} · {item.paymentStatus} · QR {item.qrLimit} · AI {item.aiUsageLimit}</div></div>)}
      </div>
    </DashboardShell>
  );
}
