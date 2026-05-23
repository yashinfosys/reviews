import { NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { analyzeReview, generateReviewReply } from "@/lib/ai";
import { demoBusiness, isDemoMode } from "@/lib/demo-data";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const form = await request.formData();
  const platform = String(form.get("platform") || "CUSTOM") as Platform;
  const reviewerName = String(form.get("reviewerName") || "");
  const rating = Number(form.get("rating") || 0) || null;
  const reviewText = String(form.get("reviewText") || "");
  const tone = String(form.get("tone") || "Professional");

  if (isDemoMode()) {
    const analysis = await analyzeReview(reviewText, rating);
    const reply = await generateReviewReply({
      businessName: demoBusiness.name,
      platform,
      reviewerName,
      rating,
      reviewText,
      tone,
      language: tone
    });
    return NextResponse.json({ reviewId: `demo-review-${Date.now()}`, reply, analysis, demoMode: true });
  }

  const business = await prisma.business.findFirst();
  if (!business) return NextResponse.json({ error: "No business configured" }, { status: 400 });
  const analysis = await analyzeReview(reviewText, rating);
  const reply = await generateReviewReply({
    businessName: business.name,
    platform,
    reviewerName,
    rating,
    reviewText,
    tone,
    language: tone
  });
  const review = await prisma.review.create({
    data: {
      businessId: business.id,
      platform,
      reviewerName,
      rating,
      reviewText,
      language: analysis.language,
      sentiment: analysis.sentiment,
      issueCategory: analysis.issueCategory,
      status: "PENDING_REPLY",
      source: "manual",
      replies: {
        create: {
          aiGeneratedReply: reply,
          language: tone,
          tone
        }
      }
    }
  });
  if ((rating || 5) <= 3 || analysis.sentiment === "negative") {
    await prisma.complaintTicket.create({
      data: {
        businessId: business.id,
        reviewId: review.id,
        guestName: reviewerName,
        platform,
        rating,
        issueCategory: analysis.issueCategory,
        reviewText,
        priority: (rating || 5) <= 2 ? "High" : "Medium",
        slaDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
      }
    });
  }
  await writeAuditLog({ businessId: business.id, action: "MANUAL_REVIEW_CREATED", entity: "Review", entityId: review.id, metadata: { platform, tone } });
  return NextResponse.json({ reviewId: review.id, reply, analysis });
}
