import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GuestFeedbackForm } from "@/components/guest-feedback-form";
import { demoBusiness, isDemoMode } from "@/lib/demo-data";

function visitTypeFromQr(qrType?: string) {
  if (!qrType) return "Other";
  if (qrType === "BANQUET_EVENT") return "Event";
  if (qrType === "GENERAL_FEEDBACK") return "Other";
  return qrType.replaceAll("_", " ");
}

export async function GuestReviewPage({ params }: { params: { businessSlug: string; locationSlug?: string; qrType?: string; label?: string } }) {
  if (isDemoMode()) {
    const location = demoBusiness.locations[0];
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-lg border bg-white p-5 shadow-soft">
          <div className="flex items-center gap-4 border-b pb-5">
            <div className="grid h-14 w-14 place-items-center rounded-md bg-primary text-xl font-bold text-white">{demoBusiness.name.charAt(0)}</div>
            <div>
              <h1 className="text-2xl font-bold">{demoBusiness.name}</h1>
              <p className="text-sm text-slate-500">{location.name}</p>
            </div>
          </div>
          <p className="mt-5 text-slate-600">{demoBusiness.welcomeMessage}</p>
          <GuestFeedbackForm
            business={demoBusiness}
            locationId={location.id}
            keywords={demoBusiness.seoKeywords.map((item) => item.keyword)}
            defaultVisitType={params.qrType || "Other"}
          />
        </div>
      </main>
    );
  }

  const business = await prisma.business.findUnique({
    where: { slug: params.businessSlug },
    include: { locations: true, seoKeywords: true }
  });
  if (!business) notFound();
  const qrCode = params.locationSlug
    ? await prisma.qRCode.findFirst({ where: { id: params.locationSlug, businessId: business.id, isActive: true } })
    : null;
  if (qrCode) await prisma.qRCode.update({ where: { id: qrCode.id }, data: { scanCount: { increment: 1 } } });
  const location = qrCode?.locationId
    ? business.locations.find((item) => item.id === qrCode.locationId)
    : params.locationSlug && !qrCode
      ? business.locations.find((item) => item.slug === params.locationSlug)
      : business.locations[0];
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-5 shadow-soft">
        <div className="flex items-center gap-4 border-b pb-5">
          <div className="grid h-14 w-14 place-items-center rounded-md bg-primary text-xl font-bold text-white">{business.name.charAt(0)}</div>
          <div>
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <p className="text-sm text-slate-500">{location?.name || business.city}</p>
          </div>
        </div>
        <p className="mt-5 text-slate-600">{business.welcomeMessage}</p>
        <GuestFeedbackForm
          business={{
            id: business.id,
            name: business.name,
            slug: business.slug,
            city: business.city,
            category: business.category,
            googleReviewLink: business.googleReviewLink,
            tripadvisorLink: business.tripadvisorLink,
            bookingLink: business.bookingLink,
            makeMyTripLink: business.makeMyTripLink,
            goibiboLink: business.goibiboLink,
            agodaLink: business.agodaLink,
            zomatoLink: business.zomatoLink,
            swiggyLink: business.swiggyLink
          }}
          locationId={location?.id}
          keywords={business.seoKeywords.map((item) => item.keyword)}
          defaultVisitType={visitTypeFromQr(qrCode?.qrType || params.qrType)}
          qrContext={qrCode ? {
            id: qrCode.id,
            qrType: qrCode.qrType,
            label: qrCode.label,
            roomNo: qrCode.roomNo,
            tableNo: qrCode.tableNo,
            eventName: qrCode.eventName,
            staffId: qrCode.staffId,
            platformTarget: qrCode.platformTarget
          } : undefined}
        />
      </div>
    </main>
  );
}
