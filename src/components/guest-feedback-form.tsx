"use client";

import { useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { GuestSuggestions } from "@/lib/ai";

type Business = {
  id: string;
  name: string;
  slug: string;
  city: string;
  category: string;
  googleReviewLink?: string | null;
  tripadvisorLink?: string | null;
  bookingLink?: string | null;
  zomatoLink?: string | null;
  swiggyLink?: string | null;
};

export function GuestFeedbackForm({ business, locationId, keywords, defaultVisitType }: { business: Business; locationId?: string; keywords: string[]; defaultVisitType: string }) {
  const [rating, setRating] = useState(5);
  const [suggestions, setSuggestions] = useState<GuestSuggestions | null>(null);
  const [feedbackId, setFeedbackId] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("rating", String(rating));
    form.set("businessId", business.id);
    if (locationId) form.set("locationId", locationId);
    form.set("keywords", JSON.stringify(keywords));
    const response = await fetch("/api/guest-feedback", { method: "POST", body: form });
    const data = await response.json();
    setSuggestions(data.suggestions);
    setFeedbackId(data.feedbackId);
  }

  async function track(platform: string, review?: string) {
    if (feedbackId) {
      await fetch(`/api/guest-feedback/${feedbackId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, copiedReview: review })
      });
    }
  }

  const links = [
    ["Post on Google", business.googleReviewLink, "GOOGLE"],
    ["Post on Tripadvisor", business.tripadvisorLink, "TRIPADVISOR"],
    ["Post on Booking.com", business.bookingLink, "BOOKING"],
    ["Post on Zomato", business.zomatoLink, "ZOMATO"],
    ["Post on Swiggy", business.swiggyLink, "SWIGGY"]
  ];

  return (
    <div className="mt-6">
      {!suggestions ? (
        <form onSubmit={submit} className="grid gap-4">
          <Input name="guestName" required placeholder="Your name" />
          <Input name="mobile" placeholder="Mobile optional" />
          <select name="visitType" defaultValue={defaultVisitType} className="h-10 rounded-md border bg-white px-3 text-sm">
            {["Room", "Restaurant", "Banquet", "Delivery", "Event", "Other"].map((type) => <option key={type}>{type}</option>)}
          </select>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setRating(value)} className="rounded-md p-1">
                <Star className={`h-8 w-8 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
          <Textarea name="feedbackText" required placeholder="Tell us about your real experience in Hinglish, Hindi or English" />
          <Button>Generate Review Suggestions</Button>
        </form>
      ) : (
        <div className="grid gap-4">
          {rating <= 3 ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">We are sorry your experience was not perfect. Your feedback has also created an internal complaint ticket for the manager.</div>
          ) : null}
          {Object.entries(suggestions).map(([key, value]) => (
            <div key={key} className="rounded-md border bg-slate-50 p-4">
              <div className="mb-2 text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}</div>
              <p className="text-sm text-slate-700">{value}</p>
              <Button className="mt-3" variant="secondary" onClick={() => { navigator.clipboard.writeText(value); track("CUSTOM", value); }}>Copy Review</Button>
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-2">
            {links.map(([label, href, platform]) => (
              <a key={label} href={href || "#"} target="_blank" onClick={() => track(platform || "CUSTOM")} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white">
                {label} <ExternalLink className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
