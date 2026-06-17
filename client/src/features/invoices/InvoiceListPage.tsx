import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInvoices } from "@/lib/queries/invoices";
import { Card, CardContent } from "@/components/ui/card";
import { CardListSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { Receipt } from "lucide-react";

export function InvoiceListPage() {
  const navigate = useNavigate();
  const { data: invoices = [], isLoading } = useInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground text-sm mt-1">All generated invoices</p>
      </div>

      {isLoading && <CardListSkeleton count={4} />}
      {!isLoading && (invoices as []).length === 0 && (
        <EmptyState title="No invoices" description="Invoices are created from purchase orders" />
      )}

      <div className="space-y-3">
        {(invoices as Array<{
          id: string; invoiceNumber: string; status: string; totalAmount: number; generatedAt: string;
          po: { vendor: { organizationName: string } };
        }>).map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card
              className="cursor-pointer hover:shadow-soft hover:border-primary/30 transition-all group"
              onClick={() => navigate(`/app/invoices/${inv.id}`)}
            >
              <CardContent className="pt-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-odoo-50 text-odoo-700 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                    <Receipt size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-primary tabular-nums">{inv.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {inv.po.vendor.organizationName} • {formatDate(inv.generatedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold tabular-nums">{formatCurrency(inv.totalAmount)}</p>
                  <div className="mt-1"><StatusBadge status={inv.status} /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
