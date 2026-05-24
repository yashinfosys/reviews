"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ configError }: { configError?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (configError) {
      setError(configError);
      return;
    }
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      redirect: false
    });
    setLoading(false);
    if (result?.error) {
      setError(
        result.error === "DATABASE_MISSING"
          ? "Database connection missing. Please configure DATABASE_URL."
          : result.error === "DatabaseNotMigrated"
            ? "Database tables are not migrated. Please run migration."
            : "Invalid email or password."
      );
      return;
    }
    router.refresh();
    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    router.push(role === "SUPER_ADMIN" ? "/super-admin" : "/admin");
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Lock className="h-4 w-4" />
        Secure Login
      </div>
      <Input name="email" type="email" required placeholder="Email address" autoComplete="email" />
      <div className="relative">
        <Input name="password" type={showPassword ? "text" : "password"} required placeholder="Password" autoComplete="current-password" className="pr-11" />
        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot Password?</Link>
      </div>
      <Button disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Signing in..." : "Login"}
      </Button>
      {configError ? <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{configError}</p> : null}
      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
