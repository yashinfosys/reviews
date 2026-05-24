import { GuestReviewPage } from "@/components/guest-review-page";

export default async function Page({ params }: { params: Promise<{ businessSlug: string; tableNo: string }> }) {
  const resolvedParams = await params;
  return <GuestReviewPage params={{ ...resolvedParams, qrType: "Table", label: `Table ${resolvedParams.tableNo}` }} />;
}
