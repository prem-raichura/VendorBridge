import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePurchaseOrders } from "@/lib/queries/purchaseOrders";
import { Card, CardContent } from "@/components/ui/card";
import { CardListSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { ShoppingCart, CheckCircle2 } from "lucide-react";

export function POListPage() {
  const navigate = useNavigate();
  const { data: pos = [], isLoading } = usePurchaseOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">All generated purchase orders</p>
      </div>

      {isLoading && <CardListSkeleton count={4} />}
      {!isLoading && (pos as []).length === 0 && (
        <EmptyState title="No purchase orders" description="Purchase orders are created after approval" />
      )}

      <div className="space-y-3">
        {(pos as Array<{
          id: string; poNumber: string; status: string; totalAmount: number; createdAt: string;
          vendor: { organizationName: string; category: string };
          quotation: { rfq: { title: string } };
          invoice?: { id: string };
        }>).map((po, i) => (
          <motion.div
            key={po.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card
              className="cursor-pointer hover:shadow-soft hover:border-primary/30 transition-all group"
              onClick={() => navigate(`/app/purchase-orders/${po.id}`)}
            >
              <CardContent className="pt-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-odoo-50 text-odoo-700 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                    <ShoppingCart size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-primary tabular-nums">{po.poNumber}</p>
                    <p className="text-sm font-medium mt-0.5 truncate">{po.quotation.rfq.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {po.vendor.organizationName} • {formatDate(po.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold tabular-nums">{formatCurrency(po.totalAmount)}</p>
                  <div className="mt-1"><StatusBadge status={po.status} /></div>
                  {po.invoice && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center justify-end gap-1">
                      <CheckCircle2 size={11} /> Invoice generated
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
