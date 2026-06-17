import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";

export async function listActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { entityType, entityId, limit = "50" } = req.query as Record<string, string>;
    const logs = await prisma.activityLog.findMany({
      where: {
        ...(entityType ? { entityType: entityType as "RFQ" | "QUOTATION" | "PO" | "INVOICE" | "VENDOR" | "USER" } : {}),
        ...(entityId ? { entityId } : {}),
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit, 10),
    });
    res.json(logs);
  } catch (e) { next(e); }
}
