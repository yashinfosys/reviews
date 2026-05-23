import { DashboardShell } from "@/components/dashboard-shell";
import { GoogleIntegrationPanel } from "@/components/google-integration-panel";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminGoogleIntegrationPage() {
  const user = await getCurrentUser();
  const business = await prisma.business.findFirst({ where: user?.businessId ? { id: user.businessId } : {}, include: { connections: true } });
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Google Business Profile Integration</h1>
      <p className="mt-2 text-sm text-slate-600">Connect OAuth, select an account/location, sync Google reviews, generate replies and post only after admin approval.</p>
      {business ? (
        <GoogleIntegrationPanel
          businessId={business.id}
          connected={business.connections.some((item) => item.platform === "GOOGLE" && item.isActive)}
        />
      ) : (
        <div className="mt-6 rounded-lg border bg-white p-4 text-sm text-slate-600 shadow-soft">No business found for this account.</div>
      )}
    </DashboardShell>
  );
}
