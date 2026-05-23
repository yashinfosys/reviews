import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Bot, CheckCircle2, Copy, Globe2, MessageSquareWarning, QrCode, Search, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

const features: Array<[string, string, LucideIcon]> = [
  ["Google reply automation", "Fetch Google reviews, draft replies and post only after admin approval.", Globe2],
  ["Manual OTA workflows", "Booking.com, MMT, Agoda, Tripadvisor, Zomato, Swiggy and Airbnb copy workflows.", Copy],
  ["Guest QR review system", "Collect honest guest feedback from rooms, tables, events and delivery orders.", QrCode],
  ["Complaint recovery", "Negative ratings create internal tickets with SLA and alert placeholders.", AlertTriangle],
  ["AI review suggestions", "English, Hindi and Hinglish suggestions based only on real guest text.", Bot],
  ["Compliance controls", "No fake reviews, no gating, no incentives and no auto-posted guest reviews.", ShieldCheck]
];

export default function HomePage() {
  return (
    <div>
      <SiteHeader />
      <section className="grid-bg border-b">
        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-4 inline-flex rounded-full border bg-white px-3 py-1 text-sm font-medium text-primary">For hotels, restaurants, cafes, salons, clinics and local businesses</div>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-950 md:text-6xl">AI Review Management for Hotels, Restaurants & Local Businesses</h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600">ReviewBoost AI helps teams collect honest guest feedback, generate compliant AI replies, manage Google reviews, handle OTA/Food app reviews manually, and recover unhappy customers faster.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/demo"><Button className="h-12 px-6">Book Demo</Button></Link>
              <Link href="/register"><Button variant="secondary" className="h-12 px-6">Start Free Trial</Button></Link>
            </div>
          </div>
          <div className="rounded-lg border bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="text-sm text-slate-500">Today</div>
                <div className="text-2xl font-bold">4.7 average rating</div>
              </div>
              <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
            </div>
            <div className="mt-5 grid gap-3">
              {["Google review waiting for reply", "Zomato screenshot converted with OCR", "Room 204 feedback created a ticket", "Hinglish review copied by guest"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md border bg-slate-50 p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold">One platform for public reviews and private recovery</h2>
          <p className="mt-3 text-slate-600">Use direct APIs where they exist, and structured manual workflows where they do not. The system keeps every rating honest and visible.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, desc, Icon]) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">{desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-3">
          {[
            ["Problem", "Reviews are scattered across Google, OTAs, food apps and private guest conversations.", MessageSquareWarning],
            ["Solution", "Bring reviews, AI replies, QR feedback, complaints and audit logs into one workflow.", Search],
            ["Compliance", "Every rating stays visible. Guests approve their own review text and post manually.", ShieldCheck]
          ].map(([title, copy, Icon]) => (
            <div key={title as string} className="rounded-lg border bg-slate-50 p-5">
              <Icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-xl font-bold">{title as string}</h2>
              <p className="mt-2 text-sm text-slate-600">{copy as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Google automation where API is available</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">Connect Google Business Profile, fetch reviews, generate AI replies, edit drafts, approve, post replies through Google API and keep audit logs.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Manual reply workflow for OTA and food apps</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">Paste reviews or upload screenshots for OCR, generate platform-specific replies, copy them, post manually, and mark replied.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Guest QR review system</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">Dynamic QR links for rooms, tables, banquets, events, staff and delivery orders can be edited without reprinting.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Negative feedback alerts</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">Ratings 1-3 and negative sentiment create tickets with priority, SLA, internal notes and WhatsApp/email placeholders.</CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-3">
          {[
            ["Starter", "Google reply, AI reply generator and 10 QR codes."],
            ["Pro", "Manual multi-platform workflows, guest suggestions and 50 QR codes."],
            ["Enterprise", "Multi-location, integrations, custom domain and advanced reports."]
          ].map(([plan, copy]) => (
            <Card key={plan}>
              <CardHeader><CardTitle>{plan}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{copy}</p>
                <Button className="mt-5 w-full">Choose {plan}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-3xl font-bold">FAQ</h2>
        <div className="mt-6 grid gap-3">
          {[
            ["Can ReviewBoost AI post guest reviews automatically?", "No. Guests must approve, copy and post reviews manually."],
            ["Does it hide negative reviewers?", "No. Negative users still see public review links and an internal complaint ticket is created."],
            ["Can it reply to Google reviews?", "Yes, through Google Business Profile API after OAuth and admin approval."],
            ["What about Booking, Zomato, Swiggy and similar platforms?", "Those use manual or semi-automated workflows unless official API credentials are available."]
          ].map(([q, a]) => (
            <div key={q} className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-1 text-sm text-slate-600">{a}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
