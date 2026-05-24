import { DashboardShell } from "@/components/dashboard-shell";

const packages = [
  { name: "Starter", qr: 10, features: "Basic dashboard, Google review reply, AI reply generator" },
  { name: "Pro", qr: 50, features: "OTA manual reviews, guest AI review suggestions, negative alerts, OCR" },
  { name: "Enterprise", qr: "Unlimited", features: "Multi-location, API integrations, white label, custom domain, advanced reports" }
];

export default function PackagesPage() {
  return (
    <DashboardShell superAdmin>
      <h1 className="text-3xl font-bold">Packages</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {packages.map((item) => (
          <section key={item.name} className="rounded-lg border bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-slate-950">{item.name}</h2>
            <div className="mt-3 text-3xl font-bold text-primary">{item.qr}</div>
            <p className="text-sm text-slate-500">Max QR Count</p>
            <p className="mt-4 text-sm text-slate-700">{item.features}</p>
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}
