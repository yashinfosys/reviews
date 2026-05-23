import { DashboardShell } from "@/components/dashboard-shell";
import { ReviewInbox } from "@/components/review-inbox";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  const reviews = await prisma.review.findMany({ where: user?.businessId ? { businessId: user.businessId } : {}, orderBy: { createdAt: "desc" }, include: { replies: true } });
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Review Inbox</h1>
      <ReviewInbox reviews={reviews as never} />
    </DashboardShell>
  );
}
