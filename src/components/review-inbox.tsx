"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Review = {
  id: string;
  platform: string;
  reviewerName?: string;
  rating?: number;
  reviewText: string;
  sentiment?: string;
  status: string;
};

const tabs = ["All", "GOOGLE", "Manual OTA", "Food Apps", "Guest Feedback", "Pending Reply", "Replied", "Negative"];

export function ReviewInbox({ reviews }: { reviews: Review[] }) {
  const [tab, setTab] = useState("All");
  const filtered = reviews.filter((review) => {
    if (tab === "All") return true;
    if (tab === "Pending Reply") return review.status === "PENDING_REPLY";
    if (tab === "Replied") return review.status === "REPLIED";
    if (tab === "Negative") return review.sentiment === "negative" || (review.rating || 5) <= 3;
    if (tab === "Manual OTA") return ["BOOKING", "MAKEMYTRIP", "GOIBIBO", "AGODA", "TRIPADVISOR", "AIRBNB"].includes(review.platform);
    if (tab === "Food Apps") return ["ZOMATO", "SWIGGY"].includes(review.platform);
    return review.platform === tab;
  });
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => <Button key={item} variant={item === tab ? "primary" : "secondary"} onClick={() => setTab(item)}>{item}</Button>)}
        </div>
        <a className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-border hover:bg-slate-50" href="/api/export/reviews">
          Export CSV
        </a>
      </div>
      <div className="mt-5 grid gap-3">
        {filtered.map((review) => (
          <div key={review.id} className="rounded-lg border bg-white p-4 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-semibold">{review.reviewerName || "Guest"} · {review.platform}</div>
              <div className="text-sm text-slate-500">{review.rating || "-"} stars · {review.status}</div>
            </div>
            <p className="mt-3 text-sm text-slate-700">{review.reviewText}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={async () => navigator.clipboard.writeText(review.reviewText)}>Copy</Button>
              <Button onClick={async () => fetch(`/api/reviews/${review.id}/reply`, { method: "POST" })}>Generate AI Reply</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
