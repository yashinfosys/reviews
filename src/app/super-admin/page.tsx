import Link from "next/link";
import { BarChart3, Building2, ClipboardList, CreditCard, PlusCircle, QrCode, Settings, ShieldCheck, Star, Ticket, Users } from "lucide-react";
import { BusinessStatus, ComplaintStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isDatabaseConnectionError } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const sidebarItems = [
  { href: "/super-admin", label: "Dashboard", icon: ShieldCheck },
  { href: "/super-admin/businesses", label: "Properties", icon: Building2 },
  { href: "/super-admin/businesses/new", label: "Add Property", icon: PlusCircle },
  { href: "/super-admin/admin-users", label: "Admin Users", icon: Users },
  { href: "/super-admin/qr-analytics", label: "QR Analytics", icon: QrCode },
  { href: "/super-admin/review-analytics", label: "Reviews", icon: Star },
  { href: "/super-admin/complaints", label: "Complaints", icon: Ticket },
  { href: "/super-admin/payments", label: "Payments", icon: CreditCard },
  { href: "/super-admin/subscriptions", label: "Subscriptions", icon: ClipboardList },
  { href: "/super-admin/settings", label: "Settings", icon: Settings }
];

export default async function SuperAdminPage() {
  try {
    const [totalProperties, activeProperties, disabledProperties, qrScans, reviews, averageRating, complaints, aiUsage, properties] = await Promise.all([
      prisma.business.count({ where: { deletedAt: null } }),
      prisma.business.count({ where: { deletedAt: null, status: BusinessStatus.ACTIVE } }),
      prisma.business.count({ where: { deletedAt: null, status: BusinessStatus.DISABLED } }),
      prisma.qRCode.aggregate({ _sum: { scanCount: true } }),
      prisma.review.count(),
      prisma.review.aggregate({ where: { rating: { not: null } }, _avg: { rating: true } }),
      prisma.complaintTicket.count({ where: { status: { in: [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS] } } }),
      prisma.aIUsageLog.count(),
      prisma.business.findMany({
        where: { deletedAt: null },
        include: {
          subscription: true,
          _count: { select: { reviews: true, complaintTickets: true, qrCodes: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

    const topProperties = await Promise.all(properties.map(async (property) => {
      const [scanStats, ratingStats] = await Promise.all([
        prisma.qRCode.aggregate({ where: { businessId: property.id }, _sum: { scanCount: true } }),
        prisma.review.aggregate({ where: { businessId: property.id, rating: { not: null } }, _avg: { rating: true } })
      ]);

      return {
        id: property.id,
        name: property.name,
        industry: property.industryType || property.category,
        city: property.city,
        plan: property.subscription?.plan || "STARTER",
        status: property.status,
        qrScans: scanStats._sum.scanCount || 0,
        reviews: property._count.reviews,
        averageRating: ratingStats._avg.rating || 0,
        complaints: property._count.complaintTickets
      };
    }));

    return (
      <div className="min-h-screen bg-slate-100">
        <SuperAdminSidebar />
        <main className="lg:pl-72">
          <div className="border-b bg-white px-4 py-4 lg:px-8">
            <div className="text-sm font-bold uppercase tracking-wide text-emerald-700">NEW SUPER ADMIN PROPERTY MANAGEMENT</div>
            <div className="text-sm text-slate-500">Live property management dashboard</div>
          </div>

          <div className="p-4 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-950">NEW SUPER ADMIN PROPERTY MANAGEMENT</h1>
                <p className="mt-1 text-sm text-slate-500">Real database overview for properties, reviews, QR scans, and complaints.</p>
              </div>
              <Link href="/super-admin/businesses/new" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 text-base font-semibold text-white shadow-soft hover:bg-teal-800">
                Add New Property
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DashboardCard label="Total Properties" value={totalProperties} />
              <DashboardCard label="Active Properties" value={activeProperties} />
              <DashboardCard label="Disabled Properties" value={disabledProperties} />
              <DashboardCard label="QR Scans" value={qrScans._sum.scanCount || 0} />
              <DashboardCard label="Reviews" value={reviews} />
              <DashboardCard label="Average Rating" value={(averageRating._avg.rating || 0).toFixed(1)} />
              <DashboardCard label="AI Usage" value={aiUsage} />
              <DashboardCard label="Complaints" value={complaints} />
            </div>

            <section className="mt-8 rounded-lg border bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">Top Performing Properties</h2>
                  <p className="mt-1 text-sm text-slate-500">Property performance from live ReviewBoost data.</p>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[1000px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Property Name</th>
                      <th className="px-4 py-3">Industry</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">QR Scans</th>
                      <th className="px-4 py-3">Reviews</th>
                      <th className="px-4 py-3">Average Rating</th>
                      <th className="px-4 py-3">Complaints</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topProperties.map((property) => (
                      <tr key={property.id}>
                        <td className="px-4 py-3 font-semibold text-slate-950">{property.name}</td>
                        <td className="px-4 py-3">{property.industry}</td>
                        <td className="px-4 py-3">{property.city || "-"}</td>
                        <td className="px-4 py-3">{property.plan}</td>
                        <td className="px-4 py-3">{property.status}</td>
                        <td className="px-4 py-3">{property.qrScans}</td>
                        <td className="px-4 py-3">{property.reviews}</td>
                        <td className="px-4 py-3">{property.averageRating.toFixed(1)}</td>
                        <td className="px-4 py-3">{property.complaints}</td>
                        <td className="px-4 py-3">
                          <Link className="font-semibold text-primary hover:underline" href={`/super-admin/businesses/${property.id}`}>View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!topProperties.length ? <div className="p-6 text-sm text-slate-500">No properties yet.</div> : null}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error;
    return (
      <div className="min-h-screen bg-slate-100">
        <SuperAdminSidebar />
        <main className="p-4 lg:pl-80 lg:pt-8">
          <h1 className="text-3xl font-bold text-slate-950">NEW SUPER ADMIN PROPERTY MANAGEMENT</h1>
          <div className="mt-4 rounded-lg border bg-white p-5 text-sm text-red-700 shadow-soft">Database connection unavailable.</div>
        </main>
      </div>
    );
  }
}

function SuperAdminSidebar() {
  return (
    <aside className="fixed hidden h-screen w-72 border-r bg-white p-4 lg:block">
      <Link href="/super-admin" className="block text-xl font-bold text-primary">ReviewBoost AI</Link>
      <div className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200">
        NEW SUPER ADMIN PROPERTY MANAGEMENT
      </div>
      <nav className="mt-6 grid gap-1">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-muted">
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function DashboardCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-soft">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-bold text-slate-950">{value}</div>
    </div>
  );
}
