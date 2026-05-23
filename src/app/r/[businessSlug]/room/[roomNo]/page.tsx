import { GuestReviewPage } from "@/components/guest-review-page";

export default function Page({ params }: { params: { businessSlug: string; roomNo: string } }) {
  return <GuestReviewPage params={{ ...params, qrType: "Room", label: `Room ${params.roomNo}` }} />;
}
