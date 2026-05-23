"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function LeadForm({ type }: { type: "demo" | "contact" }) {
  const [done, setDone] = useState(false);
  return (
    <form
      className="mt-8 grid gap-4 rounded-lg border bg-white p-5 shadow-soft"
      onSubmit={(event) => {
        event.preventDefault();
        setDone(true);
      }}
    >
      <Input required placeholder="Name" />
      <Input required type="email" placeholder="Email" />
      <Input placeholder="Business name" />
      <Textarea placeholder="Message" />
      <Button>{type === "demo" ? "Request Demo" : "Send Message"}</Button>
      {done ? <p className="text-sm font-medium text-primary">Thanks. Your request is saved as a placeholder for SMTP/CRM wiring.</p> : null}
    </form>
  );
}
