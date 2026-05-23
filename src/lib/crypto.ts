import crypto from "crypto";

function getKey() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "development-secret-change-me";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(value?: string | null) {
  if (!value) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(value?: string | null) {
  if (!value) return null;
  const [ivRaw, tagRaw, encryptedRaw] = value.split(":");
  if (!ivRaw || !tagRaw || !encryptedRaw) return value;
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64")), decipher.final()]).toString("utf8");
}
