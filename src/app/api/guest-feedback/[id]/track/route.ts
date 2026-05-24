import { NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-data";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (isDemoMode() || id.startsWith("demo-feedback")) return NextResponse.json({ ok: true, demoMode: true });

  await prisma.guestFeedback.update({
    where: { id },
    data: {
      platformClicked: body.platform in Platform ? body.platform : Platform.CUSTOM,
      copiedReview: body.copiedReview,
      selectedReviewVersion: body.selectedReviewVersion,
      otaPostedStatus: body.otaPostedStatus || (body.platform ? "PENDING_CONFIRMATION" : undefined),
      postedConfirmation: body.postedConfirmation || body.otaPostedStatus
    }
  });
  return NextResponse.json({ ok: true });
}
