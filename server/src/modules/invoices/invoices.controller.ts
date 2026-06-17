import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import { audit } from "../activity/activity.service";
import { generateInvoiceNumber } from "../../utils/numbering";
import { renderInvoicePDF } from "../../utils/pdf";
import { sendInvoiceEmail } from "../../utils/mailer";

const poInclude = {
  vendor: { select: { id: true, organizationName: true, gstNo: true, address: true, user: { select: { email: true } } } },
  quotation: { select: { id: true, items: true, gstTax: true, discount: true, subAmount: true, totalAmount: true } },
};

export async function listInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, id: userId } = req.user!;
    let where: Record<string, unknown> = {};
    if (role === "VENDOR") {
      const vendor = await prisma.vendor.findUnique({ where: { userId } });
      if (vendor) where = { po: { vendorId: vendor.id } };
    }
    const invoices = await prisma.invoice.findMany({
      where,
      include: { po: { include: { vendor: { select: { id: true, organizationName: true } } } } },
      orderBy: { generatedAt: "desc" },
    });
    res.json(invoices);
  } catch (e) { next(e); }
}

export async function createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { poId } = req.body;
    const po = await prisma.purchaseOrder.findUnique({ where: { id: poId }, include: { quotation: true } });
    if (!po) { res.status(404).json({ message: "PO not found" }); return; }
    if (po.invoice) { res.status(409).json({ message: "Invoice already exists for this PO" }); return; }

    const q = po.quotation;
    const subAmount = q.subAmount;
    const afterDiscount = subAmount - (subAmount * q.discount) / 100;
    const taxAmount = (afterDiscount * q.gstTax) / 100;
    const totalAmount = q.totalAmount;

    const invoiceNumber = generateInvoiceNumber();
    const invoice = await prisma.invoice.create({
      data: { invoiceNumber, poId, amount: subAmount, taxAmount, totalAmount, status: "GENERATED" },
    });
    await audit(req.user!.id, "GENERATED_INVOICE", "INVOICE", invoice.id);
    res.status(201).json(invoice);
  } catch (e) { next(e); }
}

export async function getInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { po: { include: poInclude } },
    });
    if (!invoice) { res.status(404).json({ message: "Invoice not found" }); return; }
    res.json(invoice);
  } catch (e) { next(e); }
}

export async function getInvoicePDF(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { po: { include: poInclude } },
    });
    if (!invoice) { res.status(404).json({ message: "Invoice not found" }); return; }

    const quotationItems = invoice.po.quotation.items as Array<{ rfqItemRef: string; unitPrice: number; qty: number }>;
    const items = quotationItems.map(i => ({ name: i.rfqItemRef, qty: i.qty, unit: "unit", unitPrice: i.unitPrice }));

    const pdfBuffer = await renderInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      generatedAt: invoice.generatedAt,
      po: {
        poNumber: invoice.po.poNumber,
        vendor: invoice.po.vendor as { organizationName: string; gstNo?: string; address?: Record<string, string> },
      },
      amount: invoice.amount,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      items,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (e) { next(e); }
}

export async function emailInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { po: { include: poInclude } },
    });
    if (!invoice) { res.status(404).json({ message: "Invoice not found" }); return; }

    const quotationItems = invoice.po.quotation.items as Array<{ rfqItemRef: string; unitPrice: number; qty: number }>;
    const items = quotationItems.map(i => ({ name: i.rfqItemRef, qty: i.qty, unit: "unit", unitPrice: i.unitPrice }));

    const pdfBuffer = await renderInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      generatedAt: invoice.generatedAt,
      po: {
        poNumber: invoice.po.poNumber,
        vendor: invoice.po.vendor as { organizationName: string; gstNo?: string; address?: Record<string, string> },
      },
      amount: invoice.amount,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      items,
    });

    const vendorWithUser = invoice.po.vendor as { user?: { email: string } };
    const toEmail = req.body.to || vendorWithUser.user?.email || "vendor@example.com";
    await sendInvoiceEmail({ to: toEmail, cc: req.body.cc, invoiceNumber: invoice.invoiceNumber, pdfBuffer, message: req.body.message });
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "SENT", sentAt: new Date() } });
    await audit(req.user!.id, "EMAILED_INVOICE", "INVOICE", invoice.id, { to: toEmail });
    res.json({ message: "Invoice emailed successfully" });
  } catch (e) { next(e); }
}

export async function updateInvoiceStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    res.json(invoice);
  } catch (e) { next(e); }
}
