import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import { audit } from "../activity/activity.service";

export async function listRfqs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!;
    const { status, search } = req.query as Record<string, string>;

    let where: Record<string, unknown> = {};
    if (role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({ where: { userId } });
      if (vendor) where = { rfqVendors: { some: { vendorId: vendor.id } } };
    }
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const rfqs = await prisma.rfq.findMany({
      where,
      include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, _count: { select: { quotations: true, rfqVendors: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(rfqs);
  } catch (e) { next(e); }
}

export async function createRfq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { vendorIds, ...data } = req.body;
    const rfq = await prisma.rfq.create({
      data: { ...data, createdById: req.user!.id, status: vendorIds?.length ? "SENT" : "DRAFT" },
    });
    if (vendorIds?.length) {
      await prisma.rfqVendor.createMany({ data: vendorIds.map((vid: string) => ({ rfqId: rfq.id, vendorId: vid })) });
    }
    await audit(req.user!.id, "CREATED_RFQ", "RFQ", rfq.id);
    res.status(201).json(rfq);
  } catch (e) { next(e); }
}

export async function getRfq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rfq = await prisma.rfq.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        rfqVendors: { include: { vendor: { select: { id: true, organizationName: true, category: true, status: true } } } },
        _count: { select: { quotations: true } },
      },
    });
    if (!rfq) { res.status(404).json({ message: "RFQ not found" }); return; }
    res.json(rfq);
  } catch (e) { next(e); }
}

export async function updateRfq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rfq = await prisma.rfq.update({ where: { id: req.params.id }, data: req.body });
    await audit(req.user!.id, "UPDATED_RFQ", "RFQ", rfq.id);
    res.json(rfq);
  } catch (e) { next(e); }
}

export async function deleteRfq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.rfq.delete({ where: { id: req.params.id } });
    res.json({ message: "RFQ deleted" });
  } catch (e) { next(e); }
}

export async function inviteVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { vendorIds } = req.body;
    const rfqId = req.params.id;
    await prisma.rfqVendor.createMany({
      data: vendorIds.map((vid: string) => ({ rfqId, vendorId: vid })),
      skipDuplicates: true,
    });
    await prisma.rfq.update({ where: { id: rfqId }, data: { status: "SENT" } });
    await audit(req.user!.id, "INVITED_VENDORS", "RFQ", rfqId, { count: vendorIds.length });
    res.json({ message: `${vendorIds.length} vendor(s) invited` });
  } catch (e) { next(e); }
}

export async function closeRfq(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rfq = await prisma.rfq.update({ where: { id: req.params.id }, data: { status: "CLOSED" } });
    await audit(req.user!.id, "CLOSED_RFQ", "RFQ", rfq.id);
    res.json(rfq);
  } catch (e) { next(e); }
}

export async function getRfqQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const quotations = await prisma.quotation.findMany({
      where: { rfqId: req.params.id },
      include: { vendor: { select: { id: true, organizationName: true, category: true, rating: true } }, approval: true },
      orderBy: { totalAmount: "asc" },
    });
    res.json(quotations);
  } catch (e) { next(e); }
}
