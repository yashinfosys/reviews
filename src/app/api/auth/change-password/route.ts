import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await requireUser();
  const form = await request.formData();
  const currentPassword = String(form.get("currentPassword") || "");
  const newPassword = String(form.get("newPassword") || "");
  const confirmPassword = String(form.get("confirmPassword") || "");

  if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ error: "New password and confirm password do not match." }, { status: 400 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const ok = await verifyPassword(currentPassword, dbUser.password);
  if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(newPassword) } });
  return NextResponse.json({ ok: true });
}
