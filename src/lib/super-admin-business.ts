import { PaymentStatus, SubscriptionPlan } from "@prisma/client";
import nodemailer from "nodemailer";

export const INDUSTRY_TYPES = [
  "Hotel",
  "Restaurant",
  "Cafe",
  "Salon",
  "Clinic",
  "Local Business",
  "Resort",
  "Banquet",
  "Cloud Kitchen",
  "Other"
];

export const PLAN_LIMITS: Record<SubscriptionPlan, { qrLimit: number; aiUsageLimit: number }> = {
  STARTER: { qrLimit: 10, aiUsageLimit: 1000 },
  PRO: { qrLimit: 50, aiUsageLimit: 5000 },
  ENTERPRISE: { qrLimit: 999999, aiUsageLimit: 50000 }
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateTemporaryPassword() {
  const token = Math.random().toString(36).slice(2, 8);
  return `Admin@${token.toUpperCase()}`;
}

export function parsePlan(value: unknown): SubscriptionPlan {
  if (value === "PRO" || value === "ENTERPRISE") return value;
  return "STARTER";
}

export function parsePaymentStatus(value: unknown): PaymentStatus {
  if (value === "ACTIVE" || value === "PAST_DUE" || value === "CANCELLED") return value;
  return "TRIAL";
}

export function toDateOrNull(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function resolveUniqueBusinessSlug(baseSlug: string, exists: (slug: string) => Promise<boolean>) {
  const cleanBase = slugify(baseSlug) || "business";
  let slug = cleanBase;
  let suffix = 2;
  while (await exists(slug)) {
    slug = `${cleanBase}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export function getWelcomeEmailBody(input: { adminName: string; adminEmail: string; temporaryPassword: string }) {
  return `Hello ${input.adminName},

Your ReviewBoost AI business account has been created.

Login URL:
https://review.yashinfosystem.in/login

Email:
${input.adminEmail}

Temporary Password:
${input.temporaryPassword}

Please login and change your password.

Regards,
Yash Infosystems`;
}

export async function sendWelcomeEmail(input: { adminName: string; adminEmail: string; temporaryPassword: string }) {
  const configured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!configured) {
    return {
      sent: false,
      message: "Business created. Email not sent because SMTP is not configured."
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: input.adminEmail,
    subject: "Welcome to ReviewBoost AI",
    text: getWelcomeEmailBody(input)
  });

  return {
    sent: true,
    message: "Business created. Welcome email sent to admin."
  };
}
