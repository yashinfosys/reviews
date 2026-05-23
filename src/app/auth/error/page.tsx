import Link from "next/link";

const messages: Record<string, string> = {
  DatabaseMissing: "Database connection missing. Please configure DATABASE_URL.",
  Configuration: "Authentication is not configured. Please check NEXTAUTH_SECRET or AUTH_SECRET, and NEXTAUTH_URL or AUTH_URL.",
  AccessDenied: "You do not have access to this area.",
  CredentialsSignin: "Invalid email or password."
};

export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  const message = messages[searchParams.error || ""] || "Authentication could not be completed.";
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-slate-950">Authentication Error</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <Link href="/login" className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white">Back to Login</Link>
      </div>
    </main>
  );
}
