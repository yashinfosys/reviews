"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SuperBusinessActions({ businessId, customQrLimit, isCustomLimitEnabled }: { businessId: string; customQrLimit?: number | null; isCustomLimitEnabled?: boolean }) {
  const router = useRouter();
  const [limit, setLimit] = useState(customQrLimit?.toString() || "");
  const [enabled, setEnabled] = useState(Boolean(isCustomLimitEnabled));
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState("");

  async function post(path: string, body?: unknown) {
    const response = await fetch(`/api/super-admin/businesses/${businessId}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "Action failed.");
      return data;
    }
    router.refresh();
    return data;
  }

  async function updateStatus(status: "ACTIVE" | "DISABLED") {
    await post(status === "ACTIVE" ? "/enable" : "/disable");
    setMessage(`Business ${status.toLowerCase()}`);
  }

  async function updateQrLimit() {
    await post("/qr-limit", { isCustomLimitEnabled: enabled, customQrLimit: limit });
    setMessage("Custom QR limit updated");
  }

  async function resetPassword() {
    const data = await post("/reset-password");
    if (data.credentials) {
      const text = `Login URL: ${data.credentials.loginUrl}\nEmail: ${data.credentials.email}\nTemporary Password: ${data.credentials.temporaryPassword}`;
      setCredentials(text);
      setMessage("Temporary password generated.");
    }
  }

  async function impersonate() {
    const data = await post("/impersonate");
    if (data.adminUrl) {
      setMessage("Access logged. Opening admin panel.");
      window.location.href = data.adminUrl;
    }
  }

  async function softDelete() {
    if (!window.confirm("Soft delete this business? Data will remain saved.")) return;
    const response = await fetch(`/api/super-admin/businesses/${businessId}`, { method: "DELETE" });
    if (response.ok) {
      setMessage("Business soft deleted.");
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "Delete failed.");
    }
  }

  return (
    <div className="mt-4 grid gap-3 border-t pt-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => updateStatus("ACTIVE")}>Enable</Button>
        <Button type="button" variant="danger" onClick={() => updateStatus("DISABLED")}>Disable</Button>
        <Button type="button" variant="secondary" onClick={impersonate}>
          <ExternalLink className="h-4 w-4" />
          Access Admin Panel
        </Button>
        <Button type="button" variant="secondary" onClick={resetPassword}>Reset Admin Password</Button>
        <Button type="button" variant="danger" onClick={softDelete}>Delete</Button>
      </div>
      <div className="grid gap-2 rounded-md bg-slate-50 p-3 md:grid-cols-[auto_1fr_auto]">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          Custom QR limit
        </label>
        <Input value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="Custom QR limit" type="number" min={0} />
        <Button type="button" variant="secondary" onClick={updateQrLimit}>Save Limit</Button>
      </div>
      {credentials ? (
        <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-sm">
          <pre className="whitespace-pre-wrap">{credentials}</pre>
          <Button type="button" variant="secondary" className="mt-2" onClick={() => navigator.clipboard.writeText(credentials)}>
            <Copy className="h-4 w-4" />
            Copy credentials
          </Button>
        </div>
      ) : null}
      {message ? <p className="text-sm font-medium text-primary">{message}</p> : null}
    </div>
  );
}
