"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, KeyRound } from "lucide-react";
import type { Role } from "@prisma/client";

export function SessionUserMenu({ name, role }: { name: string; role: Role }) {
  const [open, setOpen] = useState(false);
  const changePasswordHref = role === "SUPER_ADMIN" ? "/super-admin/change-password" : "/admin/change-password";
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-700">
        <span className="text-left">
          <span className="block leading-none">{name}</span>
          <span className="mt-1 block text-xs text-slate-500">{role.replaceAll("_", " ")}</span>
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border bg-white p-2 shadow-soft">
          <Link href={changePasswordHref} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-muted">
            <KeyRound className="h-4 w-4" />
            Change password
          </Link>
          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
