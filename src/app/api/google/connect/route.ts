import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/google";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await requireUser();
  const businessId = user.businessId || new URL(request.url).searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  return NextResponse.redirect(getGoogleOAuthUrl(businessId));
}
