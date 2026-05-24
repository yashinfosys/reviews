import { DashboardShell } from "@/components/dashboard-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReviewsAnalyticsPage() {
  const reviews = await prisma.review.findMany({ include: { business: true }, orderBy: { createdAt: "desc" }, take: 50 });
  return <DashboardShell superAdmin><h1 className="text-3xl font-bold">Reviews Analytics</h1><div className="mt-6 grid gap-3">{reviews.map((review) => <div key={review.id} className="rounded-lg border bg-white p-4 shadow-soft"><div className="font-semibold">{review.business.name} · {review.platform} · {review.rating || "-"}/5</div><div className="mt-1 text-sm text-slate-500">{review.reviewText}</div></div>)}</div></DashboardShell>;
}
