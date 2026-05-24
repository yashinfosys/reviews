import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuperQrAnalyticsPage() {
  const codes = await prisma.qRCode.findMany({ include: { business: true }, orderBy: { scanCount: "desc" }, take: 50 });
  return <DashboardShell superAdmin><h1 className="text-3xl font-bold">QR Analytics</h1><div className="mt-6 grid gap-3">{codes.map((qr) => <div key={qr.id} className="rounded-lg border bg-white p-4 shadow-soft"><div className="font-semibold">{qr.business.name} · {qr.label}</div><div className="mt-1 text-sm text-slate-500">{qr.qrType} · {qr.scanCount} scans · {qr.reviewCount} reviews · {qr.complaintCount} complaints</div></div>)}</div></DashboardShell>;
}
