import OpenAI from "openai";
import { complianceSystemPrompt } from "@/lib/compliance";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

type GuestSuggestionInput = {
  businessName: string;
  city: string;
  category: string;
  visitType: string;
  rating: number;
  feedbackText: string;
  keywords: string[];
  selectedKeywords?: string[];
};

export type GuestSuggestions = {
  shortEnglish: string;
  detailedSeoEnglish: string;
  hindi: string;
  hinglish: string;
};

export async function generateGuestReviewSuggestions(input: GuestSuggestionInput): Promise<GuestSuggestions> {
  const fallback = buildGuestSuggestionFallback(input);
  if (!openai) return fallback;

  const prompt = `Create honest review suggestions based only on this real guest experience.
Business: ${input.businessName}
City: ${input.city}
Category: ${input.category}
Visit type: ${input.visitType}
Rating: ${input.rating}
Guest optional comment: ${input.feedbackText || "No long comment provided"}
Guest selected experience keywords: ${(input.selectedKeywords || []).join(", ")}
Relevant SEO keywords, use naturally only when true: ${input.keywords.join(", ")}

Rules:
- Use only the rating, selected keywords, optional comment, business category, and city as evidence.
- Use keywords naturally and avoid keyword stuffing.
- Make each review human-written and ready for manual guest approval.
- Do not invent facts, incentives, or fake engagement.

Return JSON with keys shortEnglish, detailedSeoEnglish, hindi, hinglish.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: complianceSystemPrompt() },
        { role: "user", content: prompt }
      ]
    });
    return JSON.parse(response.choices[0]?.message.content || "{}") as GuestSuggestions;
  } catch {
    return fallback;
  }
}

type ReplyInput = {
  businessName: string;
  platform: string;
  reviewerName?: string | null;
  rating?: number | null;
  reviewText: string;
  tone: string;
  language: string;
};

export async function generateReviewReply(input: ReplyInput) {
  const fallback = buildReplyFallback(input);
  if (!openai) return fallback;

  const prompt = `Generate a review reply.
Business: ${input.businessName}
Platform: ${input.platform}
Reviewer: ${input.reviewerName || "Guest"}
Rating: ${input.rating || "Unknown"}
Tone: ${input.tone}
Language: ${input.language}
Review: ${input.reviewText}

Be professional, specific to the review, and do not claim actions that are not promised.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: complianceSystemPrompt() },
        { role: "user", content: prompt }
      ]
    });
    return response.choices[0]?.message.content || fallback;
  } catch {
    return fallback;
  }
}

export async function analyzeReview(reviewText: string, rating?: number | null) {
  const lower = reviewText.toLowerCase();
  const negativeWords = ["bad", "dirty", "slow", "rude", "poor", "worst", "late", "cold"];
  const sentiment = rating && rating <= 2 ? "negative" : negativeWords.some((word) => lower.includes(word)) ? "negative" : rating === 3 ? "mixed" : "positive";
  const issueCategory = lower.includes("food") ? "Food" : lower.includes("room") ? "Room" : lower.includes("service") || lower.includes("slow") ? "Service" : "General";
  return { language: /[\u0900-\u097F]/.test(reviewText) ? "Hindi" : "English", sentiment, issueCategory };
}

function buildGuestSuggestionFallback(input: GuestSuggestionInput): GuestSuggestions {
  const selected = input.selectedKeywords?.length ? input.selectedKeywords.join(", ") : input.visitType;
  const comment = input.feedbackText ? ` ${input.feedbackText}` : "";
  const keyword = input.keywords[0] ? ` ${input.keywords[0]}` : "";
  const base = `${input.businessName} gave us a genuine ${input.visitType.toLowerCase()} experience in ${input.city}. Highlights: ${selected}.${comment}`;
  return {
    shortEnglish: base,
    detailedSeoEnglish: `${base}${keyword ? ` It is a good option for guests looking for${keyword}.` : ""}`,
    hindi: `${input.businessName} mein hamara anubhav achha raha. ${selected} pasand aaya.${comment}`,
    hinglish: `${input.businessName} ka experience kaafi accha raha. ${selected} really achha laga.${comment}`
  };
}

function buildReplyFallback(input: ReplyInput) {
  const name = input.reviewerName || "Guest";
  if ((input.rating || 5) <= 3) {
    return `Dear ${name}, thank you for sharing your feedback. We are sorry your experience did not fully meet expectations. Our team will review this carefully and work on the areas you highlighted.`;
  }
  return `Dear ${name}, thank you for your kind review. We are delighted that you had a good experience with ${input.businessName}, and we look forward to welcoming you again.`;
}
