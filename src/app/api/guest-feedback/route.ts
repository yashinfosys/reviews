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
  const guestName = String(form.get("guestName") || "");
  const mobile = String(form.get("mobile") || "") || undefined;
  const visitType = String(form.get("visitType") || "Other");
  const rating = Number(form.get("rating") || 5);
  const feedbackText = String(form.get("feedbackText") || "");
  const keywords = JSON.parse(String(form.get("keywords") || "[]")) as string[];

  if (isDemoMode()) {
    const suggestions = demoGuestSuggestions(feedbackText);
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
    feedbackText,
    keywords
  });

  const feedback = await prisma.guestFeedback.create({
    data: {
      businessId,
      locationId,
      guestName,
      mobile,
      visitType,
      rating,
      feedbackText,
      aiSuggestionsJson: suggestions
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
        reviewText: feedbackText,
        priority: rating <= 2 ? "High" : "Medium",
        slaDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
      }
    });
  }

  return NextResponse.json({ feedbackId: feedback.id, suggestions });
}
