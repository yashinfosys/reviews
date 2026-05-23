import { NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-data";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  if (isDemoMode() || params.id.startsWith("demo-feedback")) return NextResponse.json({ ok: true, demoMode: true });

  await prisma.guestFeedback.update({
    where: { id: params.id },
    data: {
      platformClicked: body.platform in Platform ? body.platform : Platform.CUSTOM,
      copiedReview: body.copiedReview
    }
  });
  return NextResponse.json({ ok: true });
}
