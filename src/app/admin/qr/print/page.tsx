import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { createQrDataUrl } from "@/lib/qr";
import { getCurrentUser } from "@/lib/auth";
import { QR_TYPE_LABELS } from "@/lib/subscription-limits";

export const dynamic = "force-dynamic";

export default async function QRPrintPage() {
  const user = await getCurrentUser();
  const qrCodes = await prisma.qRCode.findMany({
    where: user?.businessId ? { businessId: user.businessId, isActive: true } : { isActive: true },
    orderBy: { createdAt: "desc" }
  });
  const items = await Promise.all(qrCodes.map(async (qr) => ({ qr, dataUrl: await createQrDataUrl(qr.destinationUrl) })));
  return (
    <DashboardShell>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Printable QR Sheet</h1>
      </div>
      <div className="mt-3 text-sm text-slate-600">Use your browser print dialog and choose Save as PDF for a printable sheet.</div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-3">
        {items.map(({ qr, dataUrl }) => (
          <div key={qr.id} className="break-inside-avoid rounded-lg border bg-white p-4 text-center shadow-soft">
            <img src={dataUrl} alt={qr.label} className="mx-auto h-48 w-48" />
            <div className="mt-3 font-semibold">{qr.label}</div>
            <div className="text-sm text-slate-500">{QR_TYPE_LABELS[qr.qrType] || qr.qrType}</div>
            <div className="mt-2 break-all text-xs text-slate-500">{qr.destinationUrl}</div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
