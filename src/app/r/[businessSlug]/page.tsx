import { GuestReviewPage } from "@/components/guest-review-page";

export default function Page({ params }: { params: { businessSlug: string } }) {
  return <GuestReviewPage params={params} />;
}
