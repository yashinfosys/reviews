import Link from "next/link";
import { BarChart3, Building2, ClipboardList, Globe2, Home, Inbox, QrCode, Settings, ShieldCheck, Ticket } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

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
  { href: "/super-admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/super-admin/usage", label: "Usage", icon: BarChart3 }
];

export async function DashboardShell({ children, superAdmin = false }: { children: React.ReactNode; superAdmin?: boolean }) {
  const user = await getCurrentUser();
  const links = superAdmin ? superLinks : adminLinks;
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed hidden h-screen w-64 border-r bg-white p-4 lg:block">
        <Link href="/" className="block text-xl font-bold text-primary">ReviewBoost AI</Link>
        <div className="mt-6 rounded-md bg-teal-50 p-3 text-sm text-teal-900">{user?.name || "Demo Admin"}</div>
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
          <div className="text-sm text-slate-500">Compliance-safe AI review platform</div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
