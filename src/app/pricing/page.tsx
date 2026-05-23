import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Starter", "1 business, Google replies, AI generator, 10 QR codes"],
            ["Pro", "Multi-platform manual reply, guest suggestions, 50 QR codes, alerts"],
            ["Enterprise", "Multi-location, API integrations, white label, unlimited QR"]
          ].map(([plan, detail]) => (
            <Card key={plan}><CardHeader><CardTitle>{plan}</CardTitle></CardHeader><CardContent>{detail}</CardContent></Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
