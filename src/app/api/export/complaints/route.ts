import { NextResponse } from "next/server";
import { demoTickets, isDemoMode } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const tickets = isDemoMode()
    ? demoTickets.map((ticket) => ({ ...ticket, mobile: "", platform: "CUSTOM", rating: 3, issueCategory: "Service", assignedStaff: "", slaDueAt: null, resolutionNote: "" }))
    : await prisma.complaintTicket.findMany({ orderBy: { createdAt: "desc" } });
  const rows = [
    ["Guest", "Mobile", "Platform", "Rating", "Issue", "Assigned Staff", "Status", "SLA Due", "Resolution", "Text"],
    ...tickets.map((ticket) => [
      ticket.guestName || "",
      ticket.mobile || "",
      ticket.platform || "",
      String(ticket.rating || ""),
      ticket.issueCategory || "",
      ticket.assignedStaff || "",
      ticket.status,
      ticket.slaDueAt?.toISOString?.() || "",
      ticket.resolutionNote || "",
      `"${ticket.reviewText.replace(/"/g, '""')}"`
    ])
  ];
  return new NextResponse(rows.map((row) => row.join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=reviewboost-complaints.csv" }
  });
}
