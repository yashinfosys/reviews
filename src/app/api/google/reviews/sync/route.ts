import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { syncGoogleReviews } from "@/lib/google";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  businessId: z.string().optional(),
  locationId: z.string().optional()
});

export async function POST(request: Request) {
  const user = await requireUser();
  const body = schema.parse(await request.json());
  const businessId = user.businessId || body.businessId;
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  const reviews = await syncGoogleReviews(businessId, body.locationId);
  await writeAuditLog({ businessId, userId: user.id, action: "GOOGLE_REVIEWS_SYNCED", entity: "Review", metadata: { count: reviews.length } });
  return NextResponse.json({ reviews, mode: "google-api" });
}
