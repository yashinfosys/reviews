import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-teal-800",
        variant === "secondary" && "bg-white text-slate-900 shadow-sm ring-1 ring-border hover:bg-slate-50",
        variant === "ghost" && "text-slate-700 hover:bg-muted",
        variant === "danger" && "bg-destructive text-destructive-foreground hover:bg-red-700",
        className
      )}
      {...props}
    />
  );
}
