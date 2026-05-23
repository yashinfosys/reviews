"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QR = { id: string; label: string; qrType: string; destinationUrl: string; scanCount: number; isActive: boolean };
type Business = { id: string; slug: string; locations: { id: string; slug: string; name: string }[] };

export function QRManager({ qrCodes, business }: { qrCodes: QR[]; business?: Business }) {
  const [image, setImage] = useState("");
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
      <form
        className="grid gap-4 rounded-lg border bg-white p-5 shadow-soft"
        onSubmit={async (event) => {
          event.preventDefault();
          const response = await fetch("/api/qr", { method: "POST", body: new FormData(event.currentTarget) });
          const data = await response.json();
          setImage(data.dataUrl);
        }}
      >
        <input type="hidden" name="businessId" value={business?.id || ""} />
        <Input name="label" required placeholder="Room 204 / Table 7 / Event A" />
        <select name="qrType" className="h-10 rounded-md border bg-white px-3 text-sm">
          {["Room", "Table", "Banquet", "Event", "Staff", "Delivery order", "General feedback"].map((type) => <option key={type}>{type}</option>)}
        </select>
        <Input name="destinationUrl" required defaultValue={business ? `/r/${business.slug}` : ""} placeholder="/r/business-slug" />
        <Button>Create Dynamic QR</Button>
        {image ? <img src={image} alt="Generated QR" className="rounded-md border" /> : null}
      </form>
      <div className="grid gap-3">
        {qrCodes.map((qr) => (
          <div key={qr.id} className="rounded-lg border bg-white p-4 shadow-soft">
            <div className="font-semibold">{qr.label}</div>
            <div className="mt-1 text-sm text-slate-500">{qr.qrType} · {qr.scanCount} scans · {qr.isActive ? "Active" : "Inactive"}</div>
            <div className="mt-2 text-sm">{qr.destinationUrl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
