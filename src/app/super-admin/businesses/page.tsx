import { DashboardShell } from "@/components/dashboard-shell";
import { SuperBusinessActions } from "@/components/super-business-actions";
import { prisma } from "@/lib/prisma";
import { demoBusiness, demoQrCodes, demoReviews, isDemoMode } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function SuperBusinessesPage() {
  if (isDemoMode()) {
    return (
      <DashboardShell superAdmin>
        <h1 className="text-3xl font-bold">All Businesses</h1>
        <div className="mt-6 rounded-lg border bg-white p-4 shadow-soft">
          <div className="font-semibold">{demoBusiness.name} · ACTIVE</div>
          <div className="mt-1 text-sm text-slate-500">PRO · {demoReviews.length} reviews · {demoQrCodes.length} QR</div>
          <SuperBusinessActions businessId={demoBusiness.id} developerBranding={demoBusiness.developerBranding} />
        </div>
      </DashboardShell>
    );
  }

  const businesses = await prisma.business.findMany({ include: { subscription: true, _count: { select: { reviews: true, qrCodes: true } } } });
  return (
    <DashboardShell superAdmin>
      <h1 className="text-3xl font-bold">All Businesses</h1>
      <div className="mt-6 grid gap-3">
        {businesses.map((business) => (
          <div key={business.id} className="rounded-lg border bg-white p-4 shadow-soft">
          <div className="font-semibold">{business.name} · {business.status}</div>
          <div className="mt-1 text-sm text-slate-500">{business.subscription?.plan || "STARTER"} · {business._count.reviews} reviews · {business._count.qrCodes} QR</div>
          <SuperBusinessActions businessId={business.id} developerBranding={business.developerBranding} />
        </div>
        ))}
      </div>
    </DashboardShell>
  );
}
