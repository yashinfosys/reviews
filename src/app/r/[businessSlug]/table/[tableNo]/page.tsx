import { GuestReviewPage } from "@/components/guest-review-page";

export default function Page({ params }: { params: { businessSlug: string; tableNo: string } }) {
  return <GuestReviewPage params={{ ...params, qrType: "Table", label: `Table ${params.tableNo}` }} />;
}
