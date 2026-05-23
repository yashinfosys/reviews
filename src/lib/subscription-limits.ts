import type { Subscription, SubscriptionPlan } from "@prisma/client";

export const PLAN_QR_LIMITS: Record<SubscriptionPlan, number | null> = {
  STARTER: 10,
  PRO: 50,
  ENTERPRISE: null
};

export const QR_TYPES = [
  "GENERAL_FEEDBACK",
  "ROOM",
  "TABLE",
  "BANQUET_EVENT",
  "RESTAURANT",
  "DELIVERY",
  "STAFF",
  "COMPLAINT",
  "GOOGLE_REVIEW",
  "OTA_FOOD_APP",
  "MULTI_LOCATION",
  "CUSTOM_DOMAIN",
  "BULK_GENERATION"
] as const;

export const QR_TYPE_LABELS: Record<string, string> = {
  GENERAL_FEEDBACK: "Hotel General Feedback",
  ROOM: "Room-wise QR",
  TABLE: "Table-wise QR",
  BANQUET_EVENT: "Banquet/Event QR",
  RESTAURANT: "Restaurant QR",
  DELIVERY: "Delivery QR",
  STAFF: "Staff-wise QR",
  COMPLAINT: "Complaint QR",
  GOOGLE_REVIEW: "Google Review QR",
  OTA_FOOD_APP: "OTA/Food App Review QR",
  MULTI_LOCATION: "Multi-location QR",
  CUSTOM_DOMAIN: "Custom domain QR",
  BULK_GENERATION: "Bulk QR generation"
};

const STARTER_TYPES = new Set(["GENERAL_FEEDBACK", "GOOGLE_REVIEW", "COMPLAINT"]);
const PRO_TYPES = new Set([...STARTER_TYPES, "ROOM", "TABLE", "BANQUET_EVENT", "OTA_FOOD_APP", "RESTAURANT", "DELIVERY"]);

export function getAllowedQrLimit(subscription?: Pick<Subscription, "plan" | "qrLimit" | "customQrLimit" | "isCustomLimitEnabled"> | null) {
  if (subscription?.isCustomLimitEnabled && subscription.customQrLimit != null) return subscription.customQrLimit;
  if (!subscription) return PLAN_QR_LIMITS.STARTER;
  return PLAN_QR_LIMITS[subscription.plan] ?? subscription.qrLimit ?? PLAN_QR_LIMITS.STARTER;
}

export function canCreateQrType(plan: SubscriptionPlan = "STARTER", qrType: string) {
  if (plan === "ENTERPRISE") return true;
  if (plan === "PRO") return PRO_TYPES.has(qrType);
  return STARTER_TYPES.has(qrType);
}

export function qrLimitMessage(limit: number | null) {
  if (limit == null) return "";
  return `Your current plan allows ${limit} QR codes. Upgrade to Pro for 50 QR codes or contact support for custom QR limit.`;
}
