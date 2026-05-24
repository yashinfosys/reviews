import { DashboardShell } from "@/components/dashboard-shell";

export default function PaymentsPage() {
  return <DashboardShell superAdmin><h1 className="text-3xl font-bold">Payments</h1><div className="mt-6 rounded-lg border bg-white p-5 shadow-soft text-sm text-slate-600">Monthly revenue and payment provider data will appear here when billing is connected.</div></DashboardShell>;
}
