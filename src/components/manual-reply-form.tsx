"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function ManualReplyForm() {
  const [reply, setReply] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [loadingOcr, setLoadingOcr] = useState(false);
  return (
    <form
      className="mt-6 grid gap-4 rounded-lg border bg-white p-5 shadow-soft"
      onSubmit={async (event) => {
        event.preventDefault();
        const response = await fetch("/api/manual-reviews", { method: "POST", body: new FormData(event.currentTarget) });
        const data = await response.json();
        setReply(data.reply);
      }}
    >
      <select name="platform" className="h-10 rounded-md border bg-white px-3 text-sm">
        {["BOOKING", "MAKEMYTRIP", "GOIBIBO", "AGODA", "TRIPADVISOR", "ZOMATO", "SWIGGY", "AIRBNB", "CUSTOM"].map((platform) => <option key={platform}>{platform}</option>)}
      </select>
      <Input name="reviewerName" placeholder="Reviewer name" />
      <Input name="rating" type="number" min="1" max="5" placeholder="Rating if visible" />
      <div className="rounded-md border bg-slate-50 p-4">
        <label className="text-sm font-semibold">Upload screenshot for OCR</label>
        <input
          className="mt-3 block w-full text-sm"
          name="screenshot"
          type="file"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setLoadingOcr(true);
            const body = new FormData();
            body.set("file", file);
            const response = await fetch("/api/ocr", { method: "POST", body });
            const data = await response.json();
            setOcrText(data.text || "");
            setLoadingOcr(false);
          }}
        />
        {loadingOcr ? <p className="mt-2 text-sm text-slate-500">Extracting review text...</p> : null}
      </div>
      <Textarea name="reviewText" required value={ocrText} onChange={(event) => setOcrText(event.target.value)} placeholder="Paste review text or OCR output" />
      <select name="tone" className="h-10 rounded-md border bg-white px-3 text-sm">
        {["Professional", "Friendly", "Luxury Hotel", "Restaurant", "Apology", "Short", "Detailed", "Hindi", "Hinglish", "English"].map((tone) => <option key={tone}>{tone}</option>)}
      </select>
      <Button>Generate Reply</Button>
      {reply ? (
        <div className="rounded-md border bg-slate-50 p-4">
          <p className="text-sm">{reply}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(reply)}>Copy Reply</Button>
            <Button type="button" variant="secondary" onClick={() => setReply("")}>Generate Another</Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
