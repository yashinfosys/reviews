import { DashboardShell } from "@/components/dashboard-shell";

export default function SuperSettingsPage() {
  return <DashboardShell superAdmin><h1 className="text-3xl font-bold">Settings</h1><div className="mt-6 rounded-lg border bg-white p-5 shadow-soft text-sm text-slate-600">Super admin platform settings.</div></DashboardShell>;
}
