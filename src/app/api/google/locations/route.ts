import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { fetchGoogleLocations, saveGoogleLocationMapping } from "@/lib/google";
import { writeAuditLog } from "@/lib/audit";

const postSchema = z.object({
  accountName: z.string().min(1),
  locationName: z.string().min(1),
  title: z.string().optional(),
  placeId: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional()
});

export async function GET(request: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const businessId = user.businessId || searchParams.get("businessId");
  const accountName = searchParams.get("accountName");
  if (!businessId || !accountName) return NextResponse.json({ error: "businessId and accountName required" }, { status: 400 });
  const data = await fetchGoogleLocations(businessId, accountName);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await requireUser();
  const businessId = user.businessId;
  if (!businessId) return NextResponse.json({ error: "business admin account required" }, { status: 400 });
  const body = postSchema.parse(await request.json());
  const location = await saveGoogleLocationMapping({ businessId, ...body });
  await writeAuditLog({ businessId, userId: user.id, action: "GOOGLE_LOCATION_MAPPED", entity: "Location", entityId: location.id, metadata: body });
  return NextResponse.json({ location });
}
