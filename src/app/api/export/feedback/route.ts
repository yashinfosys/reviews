import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const feedback = isDemoMode()
    ? [{ guestName: "Demo Guest", mobile: "", rating: 5, visitType: "Room", feedbackText: "Great stay", createdAt: new Date() }]
    : await prisma.guestFeedback.findMany({ orderBy: { createdAt: "desc" } });
  const rows = [
    ["Guest", "Mobile", "Rating", "Visit Type", "Feedback", "Created At"],
    ...feedback.map((item) => [
      item.guestName,
      item.mobile || "",
      String(item.rating),
      item.visitType,
      `"${item.feedbackText.replace(/"/g, '""')}"`,
      item.createdAt.toISOString()
    ])
  ];
  return new NextResponse(rows.map((row) => row.join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=reviewboost-feedback.csv" }
  });
}
