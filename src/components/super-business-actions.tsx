"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SuperBusinessActions({ businessId, developerBranding }: { businessId: string; developerBranding: string }) {
  const [branding, setBranding] = useState(developerBranding);
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
      {message ? <p className="text-sm font-medium text-primary">{message}</p> : null}
    </div>
  );
}
