import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReviewReply } from "@/lib/ai";
import { demoBusiness, demoReviews, isDemoMode } from "@/lib/demo-data";
import { writeAuditLog } from "@/lib/audit";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (isDemoMode()) {
    const review = demoReviews.find((item) => item.id === params.id);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    const reply = await generateReviewReply({
      businessName: demoBusiness.name,
      platform: review.platform,
      reviewerName: review.reviewerName,
      rating: review.rating,
      reviewText: review.reviewText,
      tone: "Professional",
      language: "English"
    });
    return NextResponse.json({ reply: { aiGeneratedReply: reply }, demoMode: true });
  }

  const review = await prisma.review.findUnique({ where: { id: params.id }, include: { business: true } });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  const reply = await generateReviewReply({
    businessName: review.business.name,
    platform: review.platform,
    reviewerName: review.reviewerName,
    rating: review.rating,
    reviewText: review.reviewText,
    tone: "Professional",
    language: "English"
  });
  const saved = await prisma.reviewReply.create({
    data: {
      reviewId: review.id,
      aiGeneratedReply: reply,
      tone: "Professional",
      language: "English"
    }
  });
  await prisma.review.update({ where: { id: review.id }, data: { status: "PENDING_REPLY" } });
  await writeAuditLog({ businessId: review.businessId, action: "AI_REPLY_GENERATED", entity: "ReviewReply", entityId: saved.id });
  return NextResponse.json({ reply: saved });
}
