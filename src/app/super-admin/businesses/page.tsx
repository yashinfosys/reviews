import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { SuperBusinessActions } from "@/components/super-business-actions";
import { prisma } from "@/lib/prisma";
import { INDUSTRY_TYPES } from "@/lib/super-admin-business";

export const dynamic = "force-dynamic";

export default async function SuperBusinessesPage({ searchParams }: { searchParams: { status?: string; plan?: string; industryType?: string; city?: string } }) {
  const where = {
    deletedAt: null,
    ...(searchParams.status && searchParams.status !== "ALL" ? { status: searchParams.status as never } : {}),
    ...(searchParams.industryType && searchParams.industryType !== "ALL" ? { industryType: searchParams.industryType } : {}),
    ...(searchParams.city ? { city: { contains: searchParams.city, mode: "insensitive" as const } } : {}),
    ...(searchParams.plan && searchParams.plan !== "ALL" ? { subscription: { plan: searchParams.plan as never } } : {})
  };
  const businesses = await prisma.business.findMany({
    where,
    include: {
      users: { where: { role: "BUSINESS_ADMIN" }, take: 1 },
      subscription: true,
      _count: { select: { reviews: true, complaintTickets: true, qrCodes: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  const ids = businesses.map((business) => business.id);
  const [qrStats, ratingStats] = await Promise.all([
    ids.length ? prisma.qRCode.groupBy({ by: ["businessId"], where: { businessId: { in: ids } }, _sum: { scanCount: true } }) : [],
    ids.length ? prisma.review.groupBy({ by: ["businessId"], where: { businessId: { in: ids }, rating: { not: null } }, _avg: { rating: true } }) : []
  ]);
  const scans = new Map(qrStats.map((item) => [item.businessId, item._sum.scanCount || 0]));
  const ratings = new Map(ratingStats.map((item) => [item.businessId, item._avg.rating || 0]));

  return (
    <DashboardShell superAdmin>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Properties / Businesses</h1>
          <p className="mt-1 text-sm text-slate-500">Manage real business profiles, admins, subscriptions, and access.</p>
        </div>
        <Link href="/super-admin/businesses/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white">Add Property</Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-lg border bg-white p-4 shadow-soft md:grid-cols-5">
        <select name="industryType" defaultValue={searchParams.industryType || "ALL" } className="h-10 rounded-md border bg-white px-3 text-sm">
          <option value="ALL">All industries</option>
          {INDUSTRY_TYPES.map((item) => <option key={item}>{item}</option>)}
        </select>
        <input name="city" defaultValue={searchParams.city || ""} placeholder="City" className="h-10 rounded-md border px-3 text-sm" />
        <select name="plan" defaultValue={searchParams.plan || "ALL"} className="h-10 rounded-md border bg-white px-3 text-sm">
          <option value="ALL">All plans</option>
          <option value="STARTER">Starter</option>
          <option value="PRO">Pro</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
        <select name="status" defaultValue={searchParams.status || "ALL"} className="h-10 rounded-md border bg-white px-3 text-sm">
          <option value="ALL">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
        <button className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white">Filter</button>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Business name</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Admin email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">QR scans</th>
                <th className="px-4 py-3">Avg rating</th>
                <th className="px-4 py-3">Reviews</th>
                <th className="px-4 py-3">Complaints</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {businesses.map((business) => (
                <tr key={business.id} className="align-top">
                  <td className="px-4 py-3 font-semibold text-slate-950">{business.name}</td>
                  <td className="px-4 py-3">{business.industryType}</td>
                  <td className="px-4 py-3">{business.city}</td>
                  <td className="px-4 py-3">{business.users[0]?.email || "-"}</td>
                  <td className="px-4 py-3">{business.subscription?.plan || "STARTER"}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{business.status}</span></td>
                  <td className="px-4 py-3">{scans.get(business.id) || 0}</td>
                  <td className="px-4 py-3">{(ratings.get(business.id) || 0).toFixed(1)}</td>
                  <td className="px-4 py-3">{business._count.reviews}</td>
                  <td className="px-4 py-3">{business._count.complaintTickets}</td>
                  <td className="px-4 py-3">{business.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link className="font-semibold text-primary hover:underline" href={`/super-admin/businesses/${business.id}`}>View / Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!businesses.length ? <div className="p-6 text-sm text-slate-500">No businesses found.</div> : null}
      </div>

      <div className="mt-6 grid gap-4">
        {businesses.map((business) => (
          <div key={`actions-${business.id}`} className="rounded-lg border bg-white p-4 shadow-soft">
            <div className="font-semibold">{business.name}</div>
            <SuperBusinessActions businessId={business.id} customQrLimit={business.subscription?.customQrLimit} isCustomLimitEnabled={business.subscription?.isCustomLimitEnabled} />
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
