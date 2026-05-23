import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { demoTickets, isDemoMode } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  if (isDemoMode()) {
    return (
      <DashboardShell>
        <h1 className="text-3xl font-bold">Complaint Tickets</h1>
        <div className="mt-6 grid gap-3">
          {demoTickets.map((ticket) => (
            <div key={ticket.id} className="rounded-lg border bg-white p-4 shadow-soft">
              <div className="font-semibold">{ticket.guestName} · {ticket.priority} · {ticket.status}</div>
              <p className="mt-2 text-sm text-slate-700">{ticket.reviewText}</p>
            </div>
          ))}
        </div>
      </DashboardShell>
    );
  }

  const user = await getCurrentUser();
  const tickets = await prisma.complaintTicket.findMany({ where: user?.businessId ? { businessId: user.businessId } : {}, orderBy: { createdAt: "desc" } });
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Complaint Tickets</h1>
      <div className="mt-6 grid gap-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="rounded-lg border bg-white p-4 shadow-soft">
            <div className="font-semibold">{ticket.guestName || "Guest"} · {ticket.priority} · {ticket.status}</div>
            <p className="mt-2 text-sm text-slate-700">{ticket.reviewText}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
