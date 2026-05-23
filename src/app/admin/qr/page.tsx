import { DashboardShell } from "@/components/dashboard-shell";
import { QRManager } from "@/components/qr-manager";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { demoBusiness, demoQrCodes, isDemoMode } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function QRPage() {
  if (isDemoMode()) {
    return (
      <DashboardShell>
        <h1 className="text-3xl font-bold">QR Management</h1>
        <QRManager qrCodes={demoQrCodes as never} business={demoBusiness as never} />
      </DashboardShell>
    );
  }

  const user = await getCurrentUser();
  const qrCodes = await prisma.qRCode.findMany({ where: user?.businessId ? { businessId: user.businessId } : {}, orderBy: { createdAt: "desc" } });
  const businesses = await prisma.business.findMany({ where: user?.businessId ? { id: user.businessId } : {}, include: { locations: true } });
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">QR Management</h1>
      <QRManager qrCodes={qrCodes as never} business={businesses[0] as never} />
    </DashboardShell>
  );
}
