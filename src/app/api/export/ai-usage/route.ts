import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const usage = isDemoMode()
    ? []
    : await prisma.aIUsageLog.findMany({ orderBy: { createdAt: "desc" }, include: { business: true, user: true } });
  const rows = [
    ["Business", "User", "Feature", "Prompt Tokens", "Completion Tokens", "Cost Estimate", "Created At"],
    ...usage.map((item) => [
      item.business?.name || "",
      item.user?.email || "",
      item.feature,
      String(item.promptTokens),
      String(item.completionTokens),
      String(item.costEstimate),
      item.createdAt.toISOString()
    ])
  ];
  return new NextResponse(rows.map((row) => row.join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=reviewboost-ai-usage.csv" }
  });
}
