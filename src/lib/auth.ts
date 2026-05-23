import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { demoUsers, isDemoMode } from "@/lib/demo-data";

const COOKIE_NAME = "reviewboost_token";

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

export function signSession(user: SessionUser) {
  return jwt.sign(user, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function decodeToken(token?: string | null): SessionUser | null {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return decodeToken(token);
}

export async function requireUser(request?: NextRequest, roles?: Role[]) {
  const token = request?.cookies.get(COOKIE_NAME)?.value || cookies().get(COOKIE_NAME)?.value;
  const user = decodeToken(token);
  if (!user) throw new Error("Unauthorized");
  if (roles?.length && !roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}

export async function authenticate(email: string, password: string) {
  if (isDemoMode()) {
    const demoUser = demoUsers.find((user) => user.email === email);
    return demoUser && password === "password123" ? demoUser : null;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessId: user.businessId
  };
}
