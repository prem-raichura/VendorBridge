import { prisma } from "../../config/prisma";
import { EntityType } from "@prisma/client";

export async function audit(
  userId: string,
  action: string,
  entityType: EntityType,
  entityId: string,
  metadata?: Record<string, unknown>
) {
  await prisma.activityLog.create({ data: { userId, action, entityType, entityId, metadata } });
}
