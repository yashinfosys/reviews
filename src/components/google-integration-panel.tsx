"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GoogleIntegrationPanel({ businessId, connected = false }: { businessId: string; connected?: boolean }) {
  const [syncResult, setSyncResult] = useState("");
  const [accounts, setAccounts] = useState<Array<{ name: string; accountName?: string }>>([]);
  const [locations, setLocations] = useState<Array<{ name: string; title?: string; metadata?: { placeId?: string }; storefrontAddress?: { locality?: string; addressLines?: string[] } }>>([]);
  const [accountName, setAccountName] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Google Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2 rounded-md border bg-slate-50 p-3">
            <CheckCircle2 className={connected ? "h-5 w-5 text-primary" : "h-5 w-5 text-slate-400"} />
            {connected ? "OAuth connection stored" : "OAuth ready. Add Google credentials in .env to connect."}
          </div>
          <a href={`/api/google/connect?businessId=${businessId}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white">
            Connect Google <ExternalLink className="h-4 w-4" />
          </a>
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              const response = await fetch(`/api/google/accounts?businessId=${businessId}`);
              const data = await response.json();
              setAccounts(data.accounts || []);
              setMessage(data.accounts?.length ? "Accounts loaded" : data.error || "No accounts returned");
            }}
          >
            Load Accounts
          </Button>
          {accounts.length ? (
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
            >
              <option value="">Select Google account</option>
              {accounts.map((account) => (
                <option key={account.name} value={account.name}>{account.accountName || account.name}</option>
              ))}
            </select>
          ) : null}
          {accountName ? (
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const response = await fetch(`/api/google/locations?businessId=${businessId}&accountName=${encodeURIComponent(accountName)}`);
                const data = await response.json();
                setLocations(data.locations || []);
                setMessage(data.locations?.length ? "Locations loaded" : data.error || "No locations returned");
              }}
            >
              Load Locations
            </Button>
          ) : null}
          {locations.length ? (
            <div className="grid gap-2">
              {locations.map((location) => (
                <button
                  key={location.name}
                  type="button"
                  className="rounded-md border bg-white p-3 text-left hover:bg-slate-50"
                  onClick={async () => {
                    const response = await fetch("/api/google/locations", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        accountName,
                        locationName: location.name,
                        title: location.title,
                        placeId: location.metadata?.placeId,
                        city: location.storefrontAddress?.locality,
                        address: location.storefrontAddress?.addressLines?.join(", ")
                      })
                    });
                    const data = await response.json();
                    setMessage(data.location ? "Google location mapped to local location" : data.error || "Unable to save location");
                  }}
                >
                  <span className="block font-medium">{location.title || location.name}</span>
                  <span className="text-xs text-slate-500">{location.name}</span>
                </button>
              ))}
            </div>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              const response = await fetch("/api/google/reviews/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId })
              });
              const data = await response.json();
              setSyncResult(`${data.reviews?.length || 0} reviews synced (${data.mode || "api"})`);
            }}
          >
            <RefreshCw className="h-4 w-4" /> Fetch Google Reviews
          </Button>
          {message ? <div className="rounded-md bg-slate-50 p-3 text-slate-700">{message}</div> : null}
          {syncResult ? <div className="rounded-md bg-teal-50 p-3 text-teal-900">{syncResult}</div> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Approval workflow</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-600">
          {[
            "Reviews are fetched through Google Business Profile API when credentials are available.",
            "AI replies are drafts until an admin edits and approves them.",
            "Posting uses Google reply API only for Google reviews.",
            "Guest-generated reviews are never auto-posted."
          ].map((item) => (
            <div key={item} className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
