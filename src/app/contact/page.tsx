import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { LeadForm } from "@/components/lead-form";

export default function ContactPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold">Contact</h1>
        <p className="mt-3 text-slate-600">For setup, integrations or enterprise plans, send a message.</p>
        <LeadForm type="contact" />
      </main>
      <Footer />
    </div>
  );
}
