import { NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateGuestReviewSuggestions } from "@/lib/ai";
import { demoBusiness, demoGuestSuggestions, isDemoMode } from "@/lib/demo-data";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(request.headers.get("x-forwarded-for") || "guest-feedback");
  if (!limited.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const form = await request.formData();
  const businessId = String(form.get("businessId") || "");
  const locationId = String(form.get("locationId") || "") || undefined;
  const qrCodeId = String(form.get("qrCodeId") || "") || undefined;
  const guestName = String(form.get("guestName") || "");
  const mobile = String(form.get("mobile") || "") || undefined;
  const visitType = String(form.get("visitType") || "Other");
  const rating = Number(form.get("rating") || 5);
  const feedbackText = String(form.get("feedbackText") || "");
  const keywords = JSON.parse(String(form.get("keywords") || "[]")) as string[];
  const selectedKeywords = JSON.parse(String(form.get("selectedKeywords") || "[]")) as string[];
  const realFeedbackText = feedbackText || selectedKeywords.join(", ") || visitType;

  if (isDemoMode()) {
    const suggestions = demoGuestSuggestions(realFeedbackText);
    return NextResponse.json({
      feedbackId: `demo-feedback-${Date.now()}`,
      suggestions,
      demoMode: true,
      business: demoBusiness.name
    });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const suggestions = await generateGuestReviewSuggestions({
    businessName: business.name,
    city: business.city,
    category: business.category,
    visitType,
    rating,
    feedbackText: realFeedbackText,
    keywords,
    selectedKeywords
  });

  const feedback = await prisma.guestFeedback.create({
    data: {
      businessId,
      locationId,
      qrCodeId,
      guestName,
      mobile,
      visitType,
      rating,
      feedbackText: realFeedbackText,
      selectedKeywords,
      aiSuggestionsJson: suggestions,
      generatedReview: suggestions
    }
  });

  if (rating <= 3) {
    await prisma.complaintTicket.create({
      data: {
        businessId,
        locationId,
        guestFeedbackId: feedback.id,
        guestName,
        mobile,
        platform: Platform.CUSTOM,
        rating,
        issueCategory: "Guest Feedback",
        reviewText: realFeedbackText,
        priority: rating <= 2 ? "High" : "Medium",
        slaDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
      }
    });
  }

  if (qrCodeId) {
    await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: {
        reviewCount: { increment: 1 },
        conversionCount: { increment: 1 },
        complaintCount: rating <= 3 ? { increment: 1 } : undefined
      }
    });
  }

  return NextResponse.json({ feedbackId: feedback.id, suggestions });
}
