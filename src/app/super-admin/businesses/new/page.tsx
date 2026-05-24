import { DashboardShell } from "@/components/dashboard-shell";
import { AddBusinessForm } from "@/components/add-business-form";

export default function NewBusinessPage() {
  return (
    <DashboardShell superAdmin>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">+ Add New Property</h1>
        <p className="mt-1 text-sm text-slate-500">Create a property profile, admin user, package, and login credentials.</p>
      </div>
      <AddBusinessForm />
    </DashboardShell>
  );
}
