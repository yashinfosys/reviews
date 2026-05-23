"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <form
      action="/api/auth/login"
      method="post"
      className="mt-6 grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/auth/login", { method: "POST", body: form });
        if (!response.ok) {
          setError("Invalid credentials");
          return;
        }
        const data = await response.json();
        router.push(data.role === "SUPER_ADMIN" ? "/super-admin" : "/admin");
      }}
    >
      <Input name="email" type="email" required placeholder="Email" />
      <Input name="password" type="password" required placeholder="Password" />
      <Button>Login</Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
