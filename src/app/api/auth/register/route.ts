import { NextResponse } from "next/server";
import { Role, SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const businessName = String(form.get("businessName") || "");
  const category = String(form.get("category") || "Local Business");
  const city = String(form.get("city") || "");
  const name = String(form.get("name") || "");
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const business = await prisma.business.create({
    data: {
      name: businessName,
      slug,
      category,
      city,
      address: city,
      settings: { create: {} },
      subscription: { create: { plan: SubscriptionPlan.STARTER } }
    }
  });
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: Role.BUSINESS_ADMIN,
      businessId: business.id
    }
  });
  return NextResponse.json({ ok: true, businessId: business.id });
}
