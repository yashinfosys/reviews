import { revalidatePath } from "next/cache";
import { Platform } from "@prisma/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const otaPlatforms = [Platform.ZOMATO, Platform.SWIGGY, Platform.BOOKING, Platform.MAKEMYTRIP, Platform.GOIBIBO, Platform.AGODA, Platform.TRIPADVISOR, Platform.AIRBNB];

async function markPosted(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await prisma.guestFeedback.update({ where: { id }, data: { otaPostedStatus: "POSTED_BY_GUEST" } });
  revalidatePath("/admin/ota-reviews");
}

async function createTicket(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const feedback = await prisma.guestFeedback.findUnique({ where: { id } });
  if (!feedback) return;
  await prisma.complaintTicket.upsert({
    where: { guestFeedbackId: feedback.id },
    update: { status: "OPEN", reviewText: feedback.feedbackText },
    create: {
      businessId: feedback.businessId,
      locationId: feedback.locationId,
      guestFeedbackId: feedback.id,
      guestName: feedback.guestName,
      mobile: feedback.mobile,
      platform: feedback.platformClicked || Platform.CUSTOM,
      rating: feedback.rating,
      issueCategory: "OTA follow-up",
      reviewText: feedback.feedbackText,
      priority: feedback.rating <= 2 ? "High" : "Medium"
    }
  });
  revalidatePath("/admin/ota-reviews");
}

export default async function OTAReviewsPage() {
  const user = await getCurrentUser();
  const businessFilter = user?.businessId ? { businessId: user.businessId } : {};
  const feedback = await prisma.guestFeedback.findMany({
    where: {
      ...businessFilter,
      OR: [{ platformClicked: { in: otaPlatforms } }, { copiedReview: { not: null } }]
    },
    include: { complaintTicket: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">OTA/Food App Reviews</h1>
      <div className="mt-3 rounded-md border bg-white p-3 text-sm text-slate-700">
        Google uses API mode when OAuth is connected. OTA and food platforms stay manual-only unless official API credentials are connected.
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border bg-white shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Suggestion copied</th>
              <th className="px-4 py-3">Posted status</th>
              <th className="px-4 py-3">Follow-up</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((item) => (
              <tr key={item.id} className="border-t align-top">
                <td className="px-4 py-3 font-medium">{item.guestName}</td>
                <td className="px-4 py-3">{item.rating}</td>
                <td className="px-4 py-3">{item.platformClicked || "CUSTOM"}</td>
                <td className="max-w-xs px-4 py-3">{item.copiedReview ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{item.otaPostedStatus.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{item.followUpStatus.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">{item.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {item.mobile ? <a className="inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-border" href={`https://wa.me/${item.mobile}`}>WhatsApp</a> : null}
                    <form action={markPosted}><input type="hidden" name="id" value={item.id} /><Button variant="secondary">Mark posted</Button></form>
                    <form action={createTicket}><input type="hidden" name="id" value={item.id} /><Button variant="danger">Create ticket</Button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
