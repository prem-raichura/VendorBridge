import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import { audit } from "../activity/activity.service";
import { generatePONumber } from "../../utils/numbering";

const include = {
  quotation: {
    include: {
      vendor: { select: { id: true, organizationName: true, rating: true } },
      rfq: { select: { id: true, title: true, category: true } },
    },
  },
  approver: { select: { id: true, firstName: true, lastName: true } },
};

export async function listPending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const approvals = await prisma.approval.findMany({ where: { decision: "PENDING" }, include, orderBy: { createdAt: "desc" } });
    res.json(approvals);
  } catch (e) { next(e); }
}

export async function listAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const approvals = await prisma.approval.findMany({ include, orderBy: { createdAt: "desc" } });
    res.json(approvals);
  } catch (e) { next(e); }
}

export async function getApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const approval = await prisma.approval.findUnique({ where: { id: req.params.id }, include });
    if (!approval) { res.status(404).json({ message: "Approval not found" }); return; }
    res.json(approval);
  } catch (e) { next(e); }
}

export async function decide(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { decision, remarks } = req.body;
    const approval = await prisma.approval.update({
      where: { id: req.params.id },
      data: { decision, remarks, approverId: req.user!.id, decidedAt: new Date() },
      include,
    });

    if (decision === "APPROVED") {
      const poNumber = generatePONumber();
      await prisma.purchaseOrder.create({
        data: {
          poNumber,
          quotationId: approval.quotationId,
          vendorId: approval.quotation.vendorId,
          createdById: req.user!.id,
          totalAmount: approval.quotation.totalAmount,
          status: "ISSUED",
        },
      });
      await audit(req.user!.id, "APPROVED_QUOTATION_PO_CREATED", "PO", approval.id, { poNumber });
    } else {
      await audit(req.user!.id, "REJECTED_APPROVAL", "QUOTATION", approval.quotationId, { remarks });
    }

    res.json(approval);
  } catch (e) { next(e); }
}
