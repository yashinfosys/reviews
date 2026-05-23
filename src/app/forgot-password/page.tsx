import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 text-center shadow-soft">
        <h1 className="text-2xl font-bold">Forgot Password?</h1>
        <p className="mt-3 text-sm text-slate-600">Password reset is not enabled yet. Please contact your administrator to reset your account password.</p>
        <Link href="/login" className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white">Back to Login</Link>
      </div>
    </main>
  );
}
