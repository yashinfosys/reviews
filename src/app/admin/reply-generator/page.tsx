import { DashboardShell } from "@/components/dashboard-shell";
import { ManualReplyForm } from "@/components/manual-reply-form";

export default function ReplyGeneratorPage() {
  return (
    <DashboardShell>
      <h1 className="text-3xl font-bold">Manual OTA/Food App Reply Generator</h1>
      <ManualReplyForm />
    </DashboardShell>
  );
}
