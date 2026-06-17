import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";

const include = {
  vendor: true,
  quotation: { include: { rfq: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  invoice: true,
};

export async function listPOs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!;
    let where: Record<string, unknown> = {};
    if (role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({ where: { userId } });
      if (vendor) where = { vendorId: vendor.id };
    }
    const pos = await prisma.purchaseOrder.findMany({ where, include, orderBy: { createdAt: "desc" } });
    res.json(pos);
  } catch (e) { next(e); }
}

export async function getPO(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: req.params.id }, include });
    if (!po) { res.status(404).json({ message: "Purchase order not found" }); return; }
    res.json(po);
  } catch (e) { next(e); }
}
