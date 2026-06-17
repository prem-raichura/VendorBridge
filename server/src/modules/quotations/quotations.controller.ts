import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import { audit } from "../activity/activity.service";

function calcAmounts(items: Array<{ unitPrice: number; qty: number }>, gstTax: number, discount: number) {
  const subAmount = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const afterDiscount = subAmount - (subAmount * discount) / 100;
  const taxAmount = (afterDiscount * gstTax) / 100;
  return { subAmount, totalAmount: afterDiscount + taxAmount };
}

export async function listQuotations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!;
    let where: Record<string, unknown> = {};
    if (role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({ where: { userId } });
      if (vendor) where = { vendorId: vendor.id };
    }
    const quotations = await prisma.quotation.findMany({
      where,
      include: { vendor: { select: { id: true, organizationName: true } }, rfq: { select: { id: true, title: true } }, approval: true },
      orderBy: { updatedAt: "desc" },
    });
    res.json(quotations);
  } catch (e) { next(e); }
}

export async function createQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.id } });
    if (!vendor) { res.status(403).json({ message: "No vendor profile" }); return; }

    const { rfqId, items, gstTax, discount, deliveryDays, paymentTerms, note, asDraft } = req.body;
    const { subAmount, totalAmount } = calcAmounts(items, gstTax ?? 18, discount ?? 0);

    const quotation = await prisma.quotation.upsert({
      where: { rfqId_vendorId: { rfqId, vendorId: vendor.id } },
      create: { rfqId, vendorId: vendor.id, items, subAmount, gstTax: gstTax ?? 18, discount: discount ?? 0, totalAmount, deliveryDays, paymentTerms, note, status: asDraft ? "DRAFT" : "SUBMITTED", submittedAt: asDraft ? null : new Date() },
      update: { items, subAmount, gstTax: gstTax ?? 18, discount: discount ?? 0, totalAmount, deliveryDays, paymentTerms, note, status: asDraft ? "DRAFT" : "SUBMITTED", submittedAt: asDraft ? null : new Date() },
    });
    await audit(req.user!.id, asDraft ? "SAVED_QUOTATION_DRAFT" : "SUBMITTED_QUOTATION", "QUOTATION", quotation.id);
    res.status(201).json(quotation);
  } catch (e) { next(e); }
}

export async function getQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { vendor: true, rfq: true, approval: { include: { approver: { select: { id: true, firstName: true, lastName: true } } } } },
    });
    if (!q) { res.status(404).json({ message: "Quotation not found" }); return; }
    res.json(q);
  } catch (e) { next(e); }
}

export async function updateQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.quotation.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.status !== "DRAFT") { res.status(400).json({ message: "Only DRAFT quotations can be edited" }); return; }

    const { items, gstTax, discount, deliveryDays, paymentTerms, note, asDraft } = req.body;
    const { subAmount, totalAmount } = calcAmounts(items ?? (existing.items as Array<{ unitPrice: number; qty: number }>), gstTax ?? existing.gstTax, discount ?? existing.discount);

    const q = await prisma.quotation.update({
      where: { id: req.params.id },
      data: { items: items ?? existing.items, subAmount, gstTax: gstTax ?? existing.gstTax, discount: discount ?? existing.discount, totalAmount, deliveryDays: deliveryDays ?? existing.deliveryDays, paymentTerms, note, status: asDraft ? "DRAFT" : "SUBMITTED", submittedAt: asDraft ? null : new Date() },
    });
    res.json(q);
  } catch (e) { next(e); }
}

export async function acceptQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = await prisma.quotation.update({ where: { id: req.params.id }, data: { status: "ACCEPTED" } });
    await prisma.approval.create({ data: { quotationId: q.id, approverId: req.user!.id, decision: "PENDING" } });
    await audit(req.user!.id, "ACCEPTED_QUOTATION", "QUOTATION", q.id);
    res.json(q);
  } catch (e) { next(e); }
}

export async function rejectQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = await prisma.quotation.update({ where: { id: req.params.id }, data: { status: "REJECTED" } });
    await audit(req.user!.id, "REJECTED_QUOTATION", "QUOTATION", q.id);
    res.json(q);
  } catch (e) { next(e); }
}
