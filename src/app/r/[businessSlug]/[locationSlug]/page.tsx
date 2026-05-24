import { GuestReviewPage } from "@/components/guest-review-page";

export default async function Page({ params }: { params: Promise<{ businessSlug: string; locationSlug: string }> }) {
  return <GuestReviewPage params={await params} />;
}
