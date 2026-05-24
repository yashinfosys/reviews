import { GuestReviewPage } from "@/components/guest-review-page";

export default async function Page({ params }: { params: Promise<{ businessSlug: string; roomNo: string }> }) {
  const resolvedParams = await params;
  return <GuestReviewPage params={{ ...resolvedParams, qrType: "Room", label: `Room ${resolvedParams.roomNo}` }} />;
}
