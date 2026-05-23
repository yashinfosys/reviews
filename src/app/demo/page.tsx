import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { LeadForm } from "@/components/lead-form";

export default function DemoPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold">Book a Demo</h1>
        <p className="mt-3 text-slate-600">Tell us about your business and we will set up a guided walkthrough.</p>
        <LeadForm type="demo" />
      </main>
      <Footer />
    </div>
  );
}
