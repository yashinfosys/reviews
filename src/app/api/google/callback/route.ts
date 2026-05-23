import { NextResponse } from "next/server";
import { saveGoogleConnection } from "@/lib/google";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) return NextResponse.json({ error: "Invalid Google callback" }, { status: 400 });
  const connection = await saveGoogleConnection(state, code);
  await writeAuditLog({ businessId: state, action: "GOOGLE_CONNECTED", entity: "PlatformConnection", entityId: connection.id });
  return NextResponse.redirect(new URL("/admin/integrations/google?connected=1", request.url));
}
