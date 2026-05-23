"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/change-password", { method: "POST", body: form });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Could not change password.");
      return;
    }
    event.currentTarget.reset();
    setMessage("Password changed successfully.");
  }

  return (
    <form onSubmit={submit} className="mt-6 grid max-w-xl gap-4 rounded-lg border bg-white p-5 shadow-soft">
      <Input name="currentPassword" type="password" required placeholder="Current password" autoComplete="current-password" />
      <Input name="newPassword" type="password" required minLength={8} placeholder="New password" autoComplete="new-password" />
      <Input name="confirmPassword" type="password" required minLength={8} placeholder="Confirm new password" autoComplete="new-password" />
      <Button disabled={loading}>{loading ? "Updating..." : "Change Password"}</Button>
      {message ? <p className="rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">{message}</p> : null}
      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
