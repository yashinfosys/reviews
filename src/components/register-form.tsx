"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [message, setMessage] = useState("");
  return (
    <form
      className="mt-8 grid gap-4 rounded-lg border bg-white p-5 shadow-soft"
      onSubmit={async (event) => {
        event.preventDefault();
        const response = await fetch("/api/auth/register", { method: "POST", body: new FormData(event.currentTarget) });
        setMessage(response.ok ? "Business created. You can login now." : "Could not create business.");
      }}
    >
      <Input name="businessName" required placeholder="Business name" />
      <Input name="category" required placeholder="Category" />
      <Input name="city" required placeholder="City" />
      <Input name="name" required placeholder="Admin name" />
      <Input name="email" required type="email" placeholder="Admin email" />
      <Input name="password" required type="password" placeholder="Password" />
      <Button>Create Business</Button>
      {message ? <p className="text-sm font-medium text-primary">{message}</p> : null}
    </form>
  );
}
