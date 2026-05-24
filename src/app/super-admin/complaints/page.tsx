import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuperComplaintsPage() {
  const complaints = await prisma.complaintTicket.findMany({ include: { business: true }, orderBy: { createdAt: "desc" }, take: 50 });
  return <DashboardShell superAdmin><h1 className="text-3xl font-bold">Complaints</h1><div className="mt-6 grid gap-3">{complaints.map((item) => <div key={item.id} className="rounded-lg border bg-white p-4 shadow-soft"><div className="font-semibold">{item.business.name} · {item.status} · {item.priority}</div><div className="mt-1 text-sm text-slate-500">{item.reviewText}</div></div>)}</div></DashboardShell>;
}
