"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Sparkles, Star } from "lucide-react";
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
  makeMyTripLink?: string | null;
  goibiboLink?: string | null;
  agodaLink?: string | null;
};

type QRContext = {
  id?: string;
  qrType?: string;
  label?: string;
  roomNo?: string | null;
  tableNo?: string | null;
  eventName?: string | null;
  staffId?: string | null;
  platformTarget?: string | null;
};

const keywordGroups = {
  Rooms: ["Clean Room", "Spacious Room", "Comfortable Bed", "Fast AC", "Luxury Interior", "Quiet Environment"],
  Food: ["Delicious Food", "Fresh Food", "Great Breakfast", "Rooftop Dining", "Fast Service", "Mocktails", "Family Dining"],
  Staff: ["Friendly Staff", "Professional Team", "Quick Support", "Great Hospitality"],
  Property: ["Great Location", "Beautiful Ambience", "Family Friendly", "Value for Money", "Parking Available", "Banquet Experience", "Live Music", "Corporate Friendly"]
};

const versionLabels: Record<keyof GuestSuggestions, string> = {
  shortEnglish: "Short English",
  detailedSeoEnglish: "SEO Detailed English",
  hindi: "Hindi",
  hinglish: "Hinglish"
};

export function GuestFeedbackForm({ business, locationId, keywords, defaultVisitType, qrContext }: { business: Business; locationId?: string; keywords: string[]; defaultVisitType: string; qrContext?: QRContext }) {
  const [rating, setRating] = useState(5);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<GuestSuggestions | null>(null);
  const [feedbackId, setFeedbackId] = useState("");
  const [postedStatus, setPostedStatus] = useState("");
  const [selectedReviewVersion, setSelectedReviewVersion] = useState<keyof GuestSuggestions>("shortEnglish");
  const [copiedVersion, setCopiedVersion] = useState("");

  const links = useMemo(() => [
    ["Google", business.googleReviewLink, "GOOGLE"],
    ["Zomato", business.zomatoLink, "ZOMATO"],
    ["Booking", business.bookingLink, "BOOKING"],
    ["Tripadvisor", business.tripadvisorLink, "TRIPADVISOR"],
    ["Swiggy", business.swiggyLink, "SWIGGY"],
    ["MMT", business.makeMyTripLink, "MAKEMYTRIP"],
    ["Goibibo", business.goibiboLink, "GOIBIBO"],
    ["Agoda", business.agodaLink, "AGODA"]
  ], [business]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("rating", String(rating));
    form.set("businessId", business.id);
    if (locationId) form.set("locationId", locationId);
    if (qrContext?.id) form.set("qrCodeId", qrContext.id);
    form.set("keywords", JSON.stringify(keywords));
    form.set("selectedKeywords", JSON.stringify(selectedKeywords));
    const response = await fetch("/api/guest-feedback", { method: "POST", body: form });
    const data = await response.json();
    setSuggestions(data.suggestions);
    setFeedbackId(data.feedbackId);
  }

  async function track(platform: string, review?: string, otaPostedStatus?: string, version?: string) {
    if (!feedbackId) return;
    await fetch(`/api/guest-feedback/${feedbackId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform,
        copiedReview: review,
        otaPostedStatus,
        postedConfirmation: otaPostedStatus,
        selectedReviewVersion: version || selectedReviewVersion
      })
    });
    if (otaPostedStatus) setPostedStatus(otaPostedStatus);
  }

  async function copyReview(version: keyof GuestSuggestions) {
    if (!suggestions) return;
    await navigator.clipboard.writeText(suggestions[version]);
    setSelectedReviewVersion(version);
    setCopiedVersion(version);
    await track("CUSTOM", suggestions[version], undefined, version);
  }

  async function copyAndOpen(platform: string, href?: string | null) {
    if (!suggestions) return;
    const review = suggestions[selectedReviewVersion];
    await navigator.clipboard.writeText(review);
    await track(platform, review, "PENDING_CONFIRMATION", selectedReviewVersion);
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }

  function toggleKeyword(keyword: string) {
    setSelectedKeywords((current) => current.includes(keyword) ? current.filter((item) => item !== keyword) : [...current, keyword]);
  }

  const contextLine = qrContext?.roomNo ? `Room ${qrContext.roomNo}` : qrContext?.tableNo ? `Table ${qrContext.tableNo}` : qrContext?.eventName ? qrContext.eventName : qrContext?.staffId ? `Staff feedback: ${qrContext.staffId}` : qrContext?.label;
  const complaintMode = qrContext?.qrType === "COMPLAINT";

  return (
    <div className="mt-6">
      {contextLine ? <div className="mb-4 rounded-md bg-teal-50 p-3 text-sm font-medium text-teal-900">{contextLine}</div> : null}
      {!suggestions ? (
        <form onSubmit={submit} className="grid gap-4">
          <Input name="guestName" required placeholder="Your name" />
          <Input name="mobile" placeholder="Mobile optional" />
          <select name="visitType" defaultValue={defaultVisitType} className="h-10 rounded-md border bg-white px-3 text-sm">
            {["Room", "Restaurant", "Banquet", "Delivery", "Event", "Other"].map((type) => <option key={type}>{type}</option>)}
          </select>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setRating(value)} className="rounded-md p-1 transition hover:scale-110">
                <Star className={`h-8 w-8 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
          </div>
          <div className="grid gap-4">
            {Object.entries(keywordGroups).map(([group, items]) => (
              <div key={group} className="rounded-lg border bg-white p-3">
                <div className="mb-3 text-sm font-semibold text-slate-700">{group}</div>
                <div className="flex flex-wrap gap-2">
                  {items.map((keyword) => {
                    const active = selectedKeywords.includes(keyword);
                    return (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => toggleKeyword(keyword)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-sm font-medium transition duration-150 hover:-translate-y-0.5 ${
                          active ? "border-primary bg-primary text-white shadow-soft" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary"
                        }`}
                      >
                        {active ? <Check className="h-3.5 w-3.5" /> : null}
                        {keyword}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Textarea name="feedbackText" placeholder={complaintMode ? "Optional: tell us what went wrong so the manager can resolve it" : "Optional comment"} />
          <Button disabled={!selectedKeywords.length && !complaintMode}>
            <Sparkles className="h-4 w-4" /> Generate My Review
          </Button>
        </form>
      ) : (
        <div className="grid gap-4">
          {rating <= 3 ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">Your feedback has also created an internal complaint ticket. You can still copy and post an honest public review if you choose.</div>
          ) : null}
          {Object.entries(suggestions).map(([key, value]) => {
            const version = key as keyof GuestSuggestions;
            const selected = selectedReviewVersion === version;
            return (
              <div key={key} className={`rounded-lg border bg-white p-4 transition ${selected ? "border-primary shadow-soft" : ""}`}>
                <button type="button" onClick={() => setSelectedReviewVersion(version)} className="mb-2 text-left text-sm font-semibold text-slate-900">
                  {versionLabels[version]}
                </button>
                <p className="text-sm leading-6 text-slate-700">{value}</p>
                <Button className="mt-3" variant="secondary" onClick={() => copyReview(version)}>
                  <Copy className="h-4 w-4" /> {copiedVersion === version ? "Copied" : "Copy"}
                </Button>
              </div>
            );
          })}
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm font-semibold">Copy selected review and open platform</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {links.slice(0, 4).map(([label, href, platform]) => (
                <Button key={label} type="button" onClick={() => copyAndOpen(platform || "CUSTOM", href)} className="justify-center">
                  Copy + Open {label} <ExternalLink className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
          <div className="rounded-md border bg-white p-4">
            <div className="text-sm font-semibold">Have you posted the review?</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => track(qrContext?.platformTarget || "CUSTOM", suggestions[selectedReviewVersion], "POSTED_BY_GUEST")}>Yes, posted</Button>
              <Button type="button" variant="ghost" onClick={() => track(qrContext?.platformTarget || "CUSTOM", suggestions[selectedReviewVersion], "PENDING_CONFIRMATION")}>Not yet</Button>
            </div>
            {postedStatus ? <p className="mt-2 text-sm text-slate-600">Status saved: {postedStatus.replaceAll("_", " ")}</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}
