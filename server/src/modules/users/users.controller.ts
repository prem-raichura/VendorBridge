import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";

const safeUser = { id: true, firstName: true, lastName: true, username: true, email: true, phone: true, country: true, avatarUrl: true, bio: true, role: true, createdAt: true, lastLoginAt: true };

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { ...safeUser, vendor: true } });
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.json(user);
  } catch (e) { next(e); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: req.body, select: safeUser });
    res.json(user);
  } catch (e) { next(e); }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({ select: safeUser, orderBy: { createdAt: "desc" } });
    res.json(users);
  } catch (e) { next(e); }
}
