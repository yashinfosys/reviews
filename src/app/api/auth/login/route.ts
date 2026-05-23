import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Use NextAuth credentials sign-in." }, { status: 410 });
}
