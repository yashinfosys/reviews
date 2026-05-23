import { DashboardShell } from "@/components/dashboard-shell";
import { QRManager } from "@/components/qr-manager";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { demoBusiness, demoQrCodes, isDemoMode } from "@/lib/demo-data";
import { getAllowedQrLimit } from "@/lib/subscription-limits";

export const dynamic = "force-dynamic";

export default async function QRPage() {
  if (isDemoMode()) {
    return (
      <DashboardShell>
        <h1 className="text-3xl font-bold">QR Management</h1>
        <QRManager qrCodes={demoQrCodes as never} business={demoBusiness as never} subscription={{ plan: "PRO", used: demoQrCodes.length, allowed: 50 }} />
      </DashboardShell>
    );
  }

  const user = await getCurrentUser();
  const businesses = await prisma.business.findMany({ where: user?.businessId ? { id: user.businessId } : {}, include: { locations: true, subscription: true } });
  const business = businesses[0];
  const qrCodes = await prisma.qRCode.findMany({ where: business ? { businessId: business.id } : {}, orderBy: { createdAt: "desc" } });
  const activeQrCount = qrCodes.filter((qr) => qr.isActive).length;
  const allowed = getAllowedQrLimit(business?.subscription);
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">QR Management</h1>
      <QRManager
        qrCodes={qrCodes as never}
        business={business as never}
        subscription={{ plan: business?.subscription?.plan || "STARTER", used: activeQrCount, allowed }}
      />
    </DashboardShell>
  );
}
