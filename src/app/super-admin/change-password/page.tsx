import { DashboardShell } from "@/components/dashboard-shell";
import { ChangePasswordForm } from "@/components/change-password-form";

export default function SuperAdminChangePasswordPage() {
  return (
    <DashboardShell superAdmin>
      <h1 className="text-3xl font-bold">Change Password</h1>
      <ChangePasswordForm />
    </DashboardShell>
  );
}
