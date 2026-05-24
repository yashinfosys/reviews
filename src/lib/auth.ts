import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessId?: string | null;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const { authOptions } = await import("@/lib/auth-options");
  const session = await getServerSession(authOptions);
  const user = session?.user as (SessionUser & { id?: string }) | undefined;
  if (!user?.email || !user.id || !user.role) return null;
  return {
    id: user.id,
    name: user.name || user.email,
    email: user.email,
    role: user.role,
    businessId: user.businessId
  };
}

export async function requireUser(_request?: NextRequest, roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (roles?.length && !roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { business: { select: { status: true, deletedAt: true } } }
  });
  if (!user) return null;
  if (!user.isActive) return null;
  if (user.role !== Role.SUPER_ADMIN && (!user.business || user.business.status !== "ACTIVE" || user.business.deletedAt)) return null;
  const ok = await verifyPassword(password, user.password);
  if (!ok) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessId: user.businessId
  };
}
