import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";

export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(notifications);
  } catch (e) { next(e); }
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { readAt: new Date() } });
    res.json({ message: "Marked as read" });
  } catch (e) { next(e); }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, readAt: null }, data: { readAt: new Date() } });
    res.json({ message: "All marked as read" });
  } catch (e) { next(e); }
}
