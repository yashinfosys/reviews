import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-data";

export async function writeAuditLog(input: {
  businessId?: string | null;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  if (isDemoMode()) return;
  await prisma.auditLog.create({
    data: {
      businessId: input.businessId || undefined,
      userId: input.userId || undefined,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId || undefined,
      metadata: input.metadata || {}
    }
  });
}
