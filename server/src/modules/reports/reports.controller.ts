import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";

export async function spendReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: { vendor: { select: { id: true, organizationName: true, category: true } } },
    });
    const byVendor = pos.reduce((acc: Record<string, { vendor: string; category: string; total: number }>, po) => {
      const key = po.vendorId;
      if (!acc[key]) acc[key] = { vendor: po.vendor.organizationName, category: po.vendor.category, total: 0 };
      acc[key].total += po.totalAmount;
      return acc;
    }, {});
    res.json(Object.values(byVendor).sort((a, b) => b.total - a.total));
  } catch (e) { next(e); }
}

export async function vendorPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        quotations: { select: { id: true, status: true, totalAmount: true, deliveryDays: true } },
        purchaseOrders: { select: { id: true, totalAmount: true, status: true } },
      },
    });
    const data = vendors.map(v => ({
      id: v.id,
      organizationName: v.organizationName,
      category: v.category,
      status: v.status,
      rating: v.rating,
      totalQuotations: v.quotations.length,
      acceptedQuotations: v.quotations.filter(q => q.status === "ACCEPTED").length,
      totalOrders: v.purchaseOrders.length,
      totalSpend: v.purchaseOrders.reduce((s, po) => s + po.totalAmount, 0),
      avgDeliveryDays: v.quotations.length ? Math.round(v.quotations.reduce((s, q) => s + q.deliveryDays, 0) / v.quotations.length) : 0,
    }));
    res.json(data);
  } catch (e) { next(e); }
}

export async function monthlyTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pos = await prisma.purchaseOrder.findMany({ orderBy: { createdAt: "asc" } });
    const byMonth: Record<string, number> = {};
    pos.forEach(po => {
      const key = po.createdAt.toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + po.totalAmount;
    });
    const data = Object.entries(byMonth).map(([month, total]) => ({ month, total }));
    res.json(data);
  } catch (e) { next(e); }
}
