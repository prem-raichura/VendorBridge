import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import { audit } from "../activity/activity.service";

export async function listVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, category, status } = req.query as Record<string, string>;
    const vendors = await prisma.vendor.findMany({
      where: {
        ...(search ? { OR: [{ organizationName: { contains: search, mode: "insensitive" } }, { gstNo: { contains: search, mode: "insensitive" } }] } : {}),
        ...(category ? { category } : {}),
        ...(status ? { status: status as "ACTIVE" | "INACTIVE" } : {}),
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(vendors);
  } catch (e) { next(e); }
}

export async function createVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendor.create({
      data: { ...req.body, userId: req.user!.id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    await audit(req.user!.id, "CREATED_VENDOR", "VENDOR", vendor.id);
    res.status(201).json(vendor);
  } catch (e) { next(e); }
}

export async function getVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
    });
    if (!vendor) { res.status(404).json({ message: "Vendor not found" }); return; }
    res.json(vendor);
  } catch (e) { next(e); }
}

export async function updateVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendor.update({ where: { id: req.params.id }, data: req.body });
    await audit(req.user!.id, "UPDATED_VENDOR", "VENDOR", vendor.id);
    res.json(vendor);
  } catch (e) { next(e); }
}

export async function deleteVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.vendor.delete({ where: { id: req.params.id } });
    res.json({ message: "Vendor deleted" });
  } catch (e) { next(e); }
}

export async function toggleVendorStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendor.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    await audit(req.user!.id, `VENDOR_STATUS_${req.body.status}`, "VENDOR", vendor.id);
    res.json(vendor);
  } catch (e) { next(e); }
}
