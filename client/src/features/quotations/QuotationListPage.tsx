import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuotations } from "@/lib/queries/quotations";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardListSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, MessageSquareQuote } from "lucide-react";

export function QuotationListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: quotations = [], isLoading } = useQuotations();
  const isVendor = user?.role === "VENDOR";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isVendor ? "Your submitted quotations" : "All vendor quotations"}
          </p>
        </div>
        {isVendor && (
          <Button variant="gradient" onClick={() => navigate("/app/rfqs")}>
            <Plus size={16} /> Submit Quote
          </Button>
        )}
      </div>

      {isLoading && <CardListSkeleton count={4} />}
      {!isLoading && (quotations as []).length === 0 && (
        <EmptyState
          title="No quotations"
          description={isVendor ? "Go to RFQs to submit a quotation" : "No quotations received yet"}
        />
      )}

      <div className="space-y-3">
        {(quotations as Array<{
          id: string;
          status: string;
          totalAmount: number;
          deliveryDays: number;
          updatedAt: string;
          rfq: { id: string; title: string };
          vendor: { organizationName: string };
        }>).map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card
              className="cursor-pointer hover:shadow-soft hover:border-primary/30 transition-all group"
              onClick={() => navigate(`/app/quotations/${q.id}`)}
            >
              <CardContent className="pt-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-odoo-50 text-odoo-700 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                    <MessageSquareQuote size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{q.rfq.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {q.vendor.organizationName} • {formatDate(q.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold tabular-nums">{formatCurrency(q.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground mb-1">{q.deliveryDays} days delivery</p>
                  <StatusBadge status={q.status} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
