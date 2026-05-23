import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_35%),linear-gradient(135deg,#0f766e,#0f172a)] px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-white/30 bg-white p-6 shadow-2xl">
        <div className="mb-6">
          <div className="text-sm font-semibold uppercase tracking-wide text-primary">Hotel-tech review platform</div>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">ReviewBoost AI</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to manage QR feedback, reviews, complaints, and AI reply workflows.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
