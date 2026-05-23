import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">Login to ReviewBoost AI</h1>
        <p className="mt-2 text-sm text-slate-500">Demo: super@reviewboost.ai or admin@reviewboost.ai / password123</p>
        <LoginForm />
      </div>
    </main>
  );
}
