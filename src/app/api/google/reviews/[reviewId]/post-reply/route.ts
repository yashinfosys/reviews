import { NextResponse } from "next/server";
import { z } from "zod";
import { ReviewStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { postGoogleReviewReply } from "@/lib/google";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  finalReply: z.string().min(3),
  tone: z.string().default("Professional"),
  language: z.string().default("English")
});

export async function POST(request: Request, { params }: { params: { reviewId: string } }) {
  const user = await requireUser();
  const body = schema.parse(await request.json());
  const review = await prisma.review.findFirst({
    where: { id: params.reviewId, businessId: user.businessId || undefined, platform: "GOOGLE" },
    include: { location: true }
  });
  if (!review?.externalReviewId) return NextResponse.json({ error: "Google review not found" }, { status: 404 });
  const googleLocationId = review.location?.googleLocationId;
  if (!googleLocationId) return NextResponse.json({ error: "Google location mapping missing" }, { status: 400 });

  const googleReply = await postGoogleReviewReply(review.businessId, googleLocationId, review.externalReviewId, body.finalReply);
  const saved = await prisma.reviewReply.create({
    data: {
      reviewId: review.id,
      aiGeneratedReply: body.finalReply,
      finalReply: body.finalReply,
      tone: body.tone,
      language: body.language,
      postedById: user.id,
      postedAt: new Date(),
      status: ReviewStatus.REPLIED
    }
  });
  await prisma.review.update({ where: { id: review.id }, data: { status: ReviewStatus.REPLIED } });
  await writeAuditLog({ businessId: review.businessId, userId: user.id, action: "GOOGLE_REPLY_POSTED", entity: "ReviewReply", entityId: saved.id, metadata: { googleReply } });
  return NextResponse.json({ reply: saved, googleReply });
}
