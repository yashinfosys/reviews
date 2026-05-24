import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { generateReviewReply } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  tone: z.enum(["Professional", "Friendly", "Luxury Hotel", "Restaurant", "Apology", "Hindi", "Hinglish", "English"]).default("Professional")
});

export async function POST(request: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  const user = await requireUser();
  const body = schema.parse(await request.json().catch(() => ({})));
  const review = await prisma.review.findFirst({
    where: { id: reviewId, businessId: user.businessId || undefined, platform: "GOOGLE" },
    include: { business: true }
  });
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  const reply = await generateReviewReply({
    businessName: review.business.name,
    platform: "GOOGLE",
    reviewerName: review.reviewerName,
    rating: review.rating,
    reviewText: review.reviewText,
    tone: body.tone,
    language: body.tone
  });
  const saved = await prisma.reviewReply.create({
    data: {
      reviewId: review.id,
      aiGeneratedReply: reply,
      tone: body.tone,
      language: body.tone
    }
  });
  await writeAuditLog({ businessId: review.businessId, userId: user.id, action: "GOOGLE_REPLY_GENERATED", entity: "ReviewReply", entityId: saved.id });
  return NextResponse.json({ reply: saved });
}
