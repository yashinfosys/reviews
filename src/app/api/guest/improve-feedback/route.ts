import { NextResponse } from "next/server";
import { improveGuestFeedback } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(request.headers.get("x-forwarded-for") || "guest-improve-feedback");
  if (!limited.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const feedbackText = String(body.feedbackText || "").trim();
  if (!feedbackText) {
    return NextResponse.json({
      cleanHinglish: "",
      professionalEnglish: "",
      simpleHindi: ""
    });
  }

  const improved = await improveGuestFeedback({
    feedbackText,
    language: String(body.language || "Hinglish"),
    selectedKeywords: Array.isArray(body.selectedKeywords) ? body.selectedKeywords.map(String) : [],
    rating: Number(body.rating || 5),
    businessName: String(body.businessName || ""),
    businessCategory: String(body.businessCategory || "")
  });

  return NextResponse.json(improved);
}
