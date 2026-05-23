import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const business = await prisma.business.findFirst({ where: user?.businessId ? { id: user.businessId } : {}, include: { settings: true, seoKeywords: true, locations: true } });
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Business Management</h1>
      <div className="mt-6 rounded-lg border bg-white p-5 shadow-soft">
        <h2 className="text-xl font-semibold">{business?.name}</h2>
        <p className="mt-2 text-sm text-slate-600">{business?.address}</p>
        <p className="mt-4 text-sm"><strong>Brand tone:</strong> {business?.settings?.brandTone}</p>
        <p className="mt-2 text-sm"><strong>SEO keywords:</strong> {business?.seoKeywords.map((item) => item.keyword).join(", ")}</p>
        <p className="mt-2 text-sm"><strong>Developer branding:</strong> {business?.developerBranding}</p>
      </div>
    </DashboardShell>
  );
}
