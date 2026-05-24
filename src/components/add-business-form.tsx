"use client";

import { useMemo, useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INDUSTRY_TYPES = ["Hotel", "Restaurant", "Cafe", "Salon", "Clinic", "Local Business", "Resort", "Banquet", "Cloud Kitchen", "Other"];
const PLAN_LIMITS = {
  STARTER: { qrLimit: 10, aiUsageLimit: 1000 },
  PRO: { qrLimit: 50, aiUsageLimit: 5000 },
  ENTERPRISE: { qrLimit: 999999, aiUsageLimit: 50000 }
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type Credentials = { loginUrl: string; email: string; temporaryPassword: string };

export function AddBusinessForm() {
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<"STARTER" | "PRO" | "ENTERPRISE">("STARTER");
  const [customLimit, setCustomLimit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const defaults = PLAN_LIMITS[plan];
  const effectiveSlug = slug || slugify(businessName);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setCredentials(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.slug = effectiveSlug;
    payload.plan = plan;
    payload.isCustomLimitEnabled = customLimit ? "true" : "";

    const response = await fetch("/api/super-admin/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error || "Unable to create business.");
      return;
    }
    setMessage(data.email?.message || "Business created.");
    setCredentials(data.credentials);
    event.currentTarget.reset();
    setBusinessName("");
    setSlug("");
  }

  const credentialText = useMemo(() => {
    if (!credentials) return "";
    return `Login URL: ${credentials.loginUrl}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.temporaryPassword}`;
  }, [credentials]);

  return (
    <form onSubmit={submit} className="grid gap-6">
      <section className="rounded-lg border bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-950">Business Details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="businessName" required placeholder="Business name" value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
          <select name="industryType" className="h-10 rounded-md border bg-white px-3 text-sm" defaultValue="Hotel">
            {INDUSTRY_TYPES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <Input name="slug" placeholder="Slug" value={effectiveSlug} onChange={(event) => setSlug(slugify(event.target.value))} />
          <Input name="logoUrl" placeholder="Logo URL optional" />
          <Input name="ownerName" placeholder="Owner name" />
          <Input name="ownerEmail" type="email" placeholder="Owner email" />
          <Input name="ownerMobile" placeholder="Owner mobile" />
          <Input name="whatsapp" placeholder="WhatsApp number" />
          <Input name="address" placeholder="Address" className="md:col-span-2" />
          <Input name="city" placeholder="City" />
          <Input name="state" placeholder="State" />
          <Input name="country" placeholder="Country" defaultValue="India" />
          <Input name="googleReviewLink" placeholder="Google review link" />
          <Input name="websiteUrl" placeholder="Website URL" />
          <select name="status" className="h-10 rounded-md border bg-white px-3 text-sm" defaultValue="ACTIVE">
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-950">Admin Details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="adminName" required placeholder="Admin name" />
          <Input name="adminEmail" required type="email" placeholder="Admin email" />
          <Input name="adminMobile" placeholder="Admin mobile" />
          <Input disabled value="Role: BUSINESS_ADMIN" />
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-950">Subscription</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <select name="plan" className="h-10 rounded-md border bg-white px-3 text-sm" value={plan} onChange={(event) => setPlan(event.target.value as typeof plan)}>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
          <Input name="qrLimit" type="number" min={0} defaultValue={defaults.qrLimit} key={`qr-${plan}`} placeholder="QR limit" />
          <Input name="aiUsageLimit" type="number" min={0} defaultValue={defaults.aiUsageLimit} key={`ai-${plan}`} placeholder="AI usage limit" />
          <Input name="validFrom" type="date" />
          <Input name="validTill" type="date" />
          <select name="paymentStatus" className="h-10 rounded-md border bg-white px-3 text-sm" defaultValue="TRIAL">
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past due</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <label className="flex h-10 items-center gap-2 rounded-md border bg-slate-50 px-3 text-sm font-medium">
            <input type="checkbox" checked={customLimit} onChange={(event) => setCustomLimit(event.target.checked)} />
            Custom QR limit
          </label>
          <Input name="customQrLimit" type="number" min={0} placeholder="Custom QR limit" disabled={!customLimit} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{loading ? "Creating..." : "Create Property"}</Button>
        {message ? <span className="text-sm font-medium text-slate-700">{message}</span> : null}
      </div>

      {credentials ? (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
          <div className="font-semibold text-teal-950">Admin credentials</div>
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-slate-700">{credentialText}</pre>
          <Button type="button" variant="secondary" className="mt-3" onClick={() => navigator.clipboard.writeText(credentialText)}>
            <Copy className="h-4 w-4" />
            Copy credentials
          </Button>
        </div>
      ) : null}
    </form>
  );
}
