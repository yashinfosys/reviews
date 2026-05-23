import { NextResponse } from "next/server";
import { demoReviews, isDemoMode } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = isDemoMode()
    ? demoReviews
    : await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  const rows = [
    ["Platform", "Reviewer", "Rating", "Sentiment", "Status", "Review"],
    ...reviews.map((review) => [
      review.platform,
      review.reviewerName || "",
      String(review.rating || ""),
      review.sentiment || "",
      review.status,
      `"${review.reviewText.replace(/"/g, '""')}"`
    ])
  ];
  return new NextResponse(rows.map((row) => row.join(",")).join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=reviewboost-reviews.csv"
    }
  });
}
