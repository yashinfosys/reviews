"use client";

import { useMemo, useState } from "react";
import { Lock, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QR_TYPE_LABELS, QR_TYPES, canCreateQrType } from "@/lib/subscription-limits";

type QR = {
  id: string;
  label: string;
  qrType: string;
  destinationUrl: string;
  scanCount: number;
  reviewCount: number;
  complaintCount: number;
  conversionCount: number;
  isActive: boolean;
};
type Business = { id: string; slug: string; locations: { id: string; slug: string; name: string }[] };
type SubscriptionInfo = { plan: "STARTER" | "PRO" | "ENTERPRISE"; used: number; allowed: number | null };

const platformOptions = ["GOOGLE", "ZOMATO", "SWIGGY", "BOOKING", "MAKEMYTRIP", "GOIBIBO", "AGODA", "TRIPADVISOR", "AIRBNB"];

export function QRManager({ qrCodes, business, subscription }: { qrCodes: QR[]; business?: Business; subscription: SubscriptionInfo }) {
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedType, setSelectedType] = useState("GENERAL_FEEDBACK");
  const [printableUrl, setPrintableUrl] = useState("");
  const allowedText = subscription.allowed == null ? "Unlimited" : String(subscription.allowed);
  const lockedTypes = useMemo(() => QR_TYPES.filter((type) => !canCreateQrType(subscription.plan, type)), [subscription.plan]);

  async function createQr(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/qr", { method: "POST", body: new FormData(event.currentTarget) });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "QR code could not be created.");
      setShowUpgrade(true);
      return;
    }
    setImage(data.dataUrl);
    setMessage("QR code created. Refresh to see it in the list.");
  }

  async function uploadBulk(file?: File) {
    if (!file || !business) return;
    setMessage("");
    const csv = await file.text();
    const response = await fetch("/api/qr/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: business.id, csv })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Bulk QR generation failed.");
      setShowUpgrade(true);
      return;
    }
    setPrintableUrl(data.printableUrl);
    setMessage(`${data.created} QR codes created from CSV. Refresh to see them in the list.`);
  }

  return (
    <div className="mt-6 grid gap-5 xl:grid-cols-[420px_1fr]">
      <form className="grid gap-4 rounded-lg border bg-white p-5 shadow-soft" onSubmit={createQr}>
        <input type="hidden" name="businessId" value={business?.id || ""} />
        <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
          {subscription.used} of {allowedText} QR codes used on {subscription.plan}.
        </div>
        <Input name="label" required placeholder="Room 204 / Table 7 / Wedding Event" />
        <select name="qrType" value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="h-10 rounded-md border bg-white px-3 text-sm">
          {QR_TYPES.map((type) => {
            const locked = lockedTypes.includes(type);
            return <option key={type} value={type}>{QR_TYPE_LABELS[type]}{locked ? " - Locked" : ""}</option>;
          })}
        </select>
        {business?.locations?.length ? (
          <select name="locationId" className="h-10 rounded-md border bg-white px-3 text-sm">
            <option value="">Business default location</option>
            {business.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </select>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="roomNo" placeholder="Room no" />
          <Input name="tableNo" placeholder="Table no" />
          <Input name="eventName" placeholder="Event name" />
          <Input name="staffId" placeholder="Staff name/id" />
        </div>
        <select name="platformTarget" className="h-10 rounded-md border bg-white px-3 text-sm" defaultValue="">
          <option value="">No platform target</option>
          {platformOptions.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
        </select>
        {lockedTypes.includes(selectedType as never) ? (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Lock className="mt-0.5 h-4 w-4" />
            <span>This QR type is visible for planning, but locked on {subscription.plan}. Upgrade or ask the super admin for a custom limit.</span>
          </div>
        ) : null}
        <Button>Create Dynamic QR</Button>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-3 text-sm text-slate-600">
          <Upload className="h-4 w-4" />
          Upload CSV for bulk QR generation
          <input type="file" accept=".csv" className="hidden" onChange={(event) => uploadBulk(event.target.files?.[0])} />
        </label>
        {printableUrl ? <a className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-border" href={printableUrl}>Open printable PDF sheet</a> : null}
        <div className="grid gap-2 sm:grid-cols-2">
          <a className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-border" href="/api/qr/export/zip">Download ZIP</a>
          <a className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-border" href="/admin/qr/print">Printable PDF Sheet</a>
        </div>
        {message ? <p className="text-sm font-medium text-primary">{message}</p> : null}
        {image ? <img src={image} alt="Generated QR" className="rounded-md border" /> : null}
      </form>
      <div className="grid gap-3">
        {qrCodes.map((qr) => (
          <div key={qr.id} className="rounded-lg border bg-white p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{qr.label}</div>
                <div className="mt-1 text-sm text-slate-500">{QR_TYPE_LABELS[qr.qrType] || qr.qrType} · {qr.isActive ? "Active" : "Inactive"}</div>
              </div>
              <div className="text-right text-sm text-slate-600">{qr.scanCount} scans · {qr.conversionCount} conversions</div>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
              <span>{qr.reviewCount} reviews</span>
              <span>{qr.complaintCount} complaints</span>
              <span>{Math.round((qr.conversionCount / Math.max(qr.scanCount, 1)) * 100)}% rate</span>
            </div>
            <div className="mt-2 break-all text-sm">{qr.destinationUrl}</div>
          </div>
        ))}
      </div>
      {showUpgrade ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Upgrade QR Access</h2>
              <button type="button" onClick={() => setShowUpgrade(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-700">
              <p>Current plan: <strong>{subscription.plan}</strong></p>
              <p>Used QR codes: <strong>{subscription.used}</strong></p>
              <p>Allowed QR codes: <strong>{allowedText}</strong></p>
            </div>
            <div className="mt-5 grid gap-2">
              <Button type="button">Upgrade to Pro</Button>
              <Button type="button" variant="secondary">Upgrade to Enterprise</Button>
              <Button type="button" variant="ghost">Contact Super Admin for custom limit</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
