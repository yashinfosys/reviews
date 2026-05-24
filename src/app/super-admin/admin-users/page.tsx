import { Role } from "@prisma/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ where: { role: Role.BUSINESS_ADMIN }, include: { business: true }, orderBy: { createdAt: "desc" } });
  return (
    <DashboardShell superAdmin>
      <h1 className="text-3xl font-bold">Admin Users</h1>
      <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Business</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody className="divide-y">{users.map((user) => <tr key={user.id}><td className="px-4 py-3">{user.name}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3">{user.business?.name || "-"}</td><td className="px-4 py-3">{user.isActive ? "Active" : "Inactive"}</td></tr>)}</tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
