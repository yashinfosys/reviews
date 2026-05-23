import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { fetchGoogleAccounts } from "@/lib/google";

export async function GET(request: Request) {
  const user = await requireUser();
  const businessId = user.businessId || new URL(request.url).searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
  const data = await fetchGoogleAccounts(businessId);
  return NextResponse.json(data);
}
