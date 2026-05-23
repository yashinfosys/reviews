import { DashboardShell } from "@/components/dashboard-shell";
import { GoogleIntegrationPanel } from "@/components/google-integration-panel";
import { demoBusiness, isDemoMode } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminGoogleIntegrationPage() {
  const business = isDemoMode()
    ? demoBusiness
    : await prisma.business.findFirst({ include: { connections: true } });
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Google Business Profile Integration</h1>
      <p className="mt-2 text-sm text-slate-600">Connect OAuth, select an account/location, sync Google reviews, generate replies and post only after admin approval.</p>
      <GoogleIntegrationPanel
        businessId={business?.id || demoBusiness.id}
        connected={!isDemoMode() && Boolean(business && "connections" in business && business.connections.some((item) => item.platform === "GOOGLE" && item.isActive))}
      />
    </DashboardShell>
  );
}
