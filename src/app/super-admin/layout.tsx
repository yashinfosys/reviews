import Link from "next/link";
import { BarChart3, Building2, ClipboardList, CreditCard, PlusCircle, QrCode, Settings, ShieldCheck, Ticket, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { SessionUserMenu } from "@/components/session-user-menu";

const superAdminLinks = [
  { href: "/super-admin", label: "Overview", icon: ShieldCheck },
  { href: "/super-admin/businesses", label: "Properties", icon: Building2 },
  { href: "/super-admin/businesses/new", label: "Add Property", icon: PlusCircle },
  { href: "/super-admin/admin-users", label: "Admin Users", icon: Users },
  { href: "/super-admin/packages", label: "Packages", icon: ClipboardList },
  { href: "/super-admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/super-admin/qr-analytics", label: "QR Analytics", icon: QrCode },
  { href: "/super-admin/review-analytics", label: "Review Analytics", icon: BarChart3 },
  { href: "/super-admin/complaints", label: "Complaints", icon: Ticket },
  { href: "/super-admin/payments", label: "Payments", icon: CreditCard },
  { href: "/super-admin/settings", label: "Settings", icon: Settings }
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed hidden h-screen w-72 border-r bg-white p-4 lg:block">
        <Link href="/super-admin" className="block text-xl font-bold text-primary">ReviewBoost AI</Link>
        <div className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200">
          NEW SUPER ADMIN UI
        </div>
        <div className="mt-6 rounded-md bg-teal-50 p-3 text-sm text-teal-900">
          <div className="font-semibold">{user?.name || "Super Admin"}</div>
          <div className="text-xs uppercase tracking-wide text-teal-700">Property Management</div>
        </div>
        <nav className="mt-6 grid gap-1">
          {superAdminLinks.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-muted">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <div className="border-b bg-white px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold uppercase tracking-wide text-emerald-700">NEW SUPER ADMIN UI</div>
              <div className="text-sm text-slate-500">Property management dashboard</div>
            </div>
            {user ? <SessionUserMenu name={user.name} role={user.role} /> : null}
          </div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
