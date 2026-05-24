import Link from "next/link";
import { BarChart3, Building2, ClipboardList, CreditCard, Globe2, Home, Inbox, PlusCircle, QrCode, Settings, ShieldCheck, Ticket, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { SessionUserMenu } from "@/components/session-user-menu";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/reviews", label: "Review Inbox", icon: Inbox },
  { href: "/admin/integrations/google", label: "Google", icon: Globe2 },
  { href: "/admin/reply-generator", label: "AI Reply", icon: ClipboardList },
  { href: "/admin/qr", label: "QR Codes", icon: QrCode },
  { href: "/admin/qr-analytics", label: "QR Analytics", icon: BarChart3 },
  { href: "/admin/ota-reviews", label: "OTA Reviews", icon: ClipboardList },
  { href: "/admin/tickets", label: "Complaints", icon: Ticket },
  { href: "/admin/settings", label: "Business", icon: Settings }
];

const superLinks = [
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

export async function DashboardShell({ children, superAdmin = false }: { children: React.ReactNode; superAdmin?: boolean }) {
  const user = await getCurrentUser();
  const links = superAdmin ? superLinks : adminLinks;
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed hidden h-screen w-64 border-r bg-white p-4 lg:block">
        <Link href={superAdmin ? "/super-admin" : "/admin"} className="block text-xl font-bold text-primary">ReviewBoost AI</Link>
        {superAdmin ? (
          <div className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200">
            NEW SUPER ADMIN UI
          </div>
        ) : null}
        <div className="mt-6 rounded-md bg-teal-50 p-3 text-sm text-teal-900">{user?.name || "Signed in user"}</div>
        <nav className="mt-6 grid gap-1">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-muted">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="border-b bg-white px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              {superAdmin ? <div className="text-sm font-bold uppercase tracking-wide text-emerald-700">NEW SUPER ADMIN UI</div> : null}
              <div className="text-sm text-slate-500">Compliance-safe AI review platform</div>
            </div>
            {user ? <SessionUserMenu name={user.name} role={user.role} /> : null}
          </div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
