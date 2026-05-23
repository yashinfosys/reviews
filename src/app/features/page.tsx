import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";

export default function FeaturesPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-4xl font-bold">Features</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {["Google Business Profile reviews and replies", "Manual OTA/Food app reply workflows", "Guest QR pages for rooms, tables and events", "AI suggestions in English, Hindi and Hinglish", "Negative feedback tickets and SLA tracking", "Super admin subscriptions and usage controls"].map((item) => (
            <div key={item} className="rounded-lg border bg-white p-5 shadow-soft">{item}</div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
