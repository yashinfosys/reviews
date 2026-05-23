"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SuperBusinessActions({ businessId, developerBranding, customQrLimit, isCustomLimitEnabled }: { businessId: string; developerBranding: string; customQrLimit?: number | null; isCustomLimitEnabled?: boolean }) {
  const [branding, setBranding] = useState(developerBranding);
  const [limit, setLimit] = useState(customQrLimit?.toString() || "");
  const [enabled, setEnabled] = useState(Boolean(isCustomLimitEnabled));
  const [message, setMessage] = useState("");
  async function updateStatus(status: "ACTIVE" | "DISABLED") {
    await fetch(`/api/super-admin/businesses/${businessId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setMessage(`Business ${status.toLowerCase()}`);
  }
  async function updateBranding() {
    await fetch(`/api/super-admin/businesses/${businessId}/branding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ developerBranding: branding })
    });
    setMessage("Developer branding updated");
  }
  async function updateQrLimit() {
    await fetch(`/api/super-admin/businesses/${businessId}/qr-limit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCustomLimitEnabled: enabled, customQrLimit: limit })
    });
    setMessage("Custom QR limit updated");
  }
  return (
    <div className="mt-4 grid gap-3 border-t pt-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => updateStatus("ACTIVE")}>Activate</Button>
        <Button type="button" variant="danger" onClick={() => updateStatus("DISABLED")}>Disable</Button>
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <Input value={branding} onChange={(event) => setBranding(event.target.value)} />
        <Button type="button" onClick={updateBranding}>Save Branding</Button>
      </div>
      <div className="grid gap-2 rounded-md bg-slate-50 p-3 md:grid-cols-[auto_1fr_auto]">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          Custom QR limit
        </label>
        <Input value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="Custom QR limit" type="number" min={0} />
        <Button type="button" variant="secondary" onClick={updateQrLimit}>Save Limit</Button>
      </div>
      {message ? <p className="text-sm font-medium text-primary">{message}</p> : null}
    </div>
  );
}
