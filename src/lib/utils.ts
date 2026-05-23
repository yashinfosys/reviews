import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ratingSentiment(rating?: number | null, text = "") {
  if (rating && rating <= 2) return "negative";
  if (rating === 3) return "mixed";
  const lower = text.toLowerCase();
  if (["bad", "poor", "dirty", "slow", "rude", "worst", "complaint"].some((word) => lower.includes(word))) {
    return "negative";
  }
  return "positive";
}
