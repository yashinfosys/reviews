import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-4xl font-bold">Register Business</h1>
      <p className="mt-3 text-slate-600">Create a starter business workspace.</p>
      <RegisterForm />
    </main>
  );
}
