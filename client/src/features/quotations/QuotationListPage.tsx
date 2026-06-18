import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuotations } from "@/lib/queries/quotations";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus } from "lucide-react";

export default function QuotationListPage() {
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

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading && <TableSkeleton rows={5} cols={6} />}
          {!isLoading && (quotations as []).length === 0 && (
            <div className="py-12">
              <EmptyState
                title="No quotations"
                description={isVendor ? "Go to RFQs to submit a quotation" : "No quotations received yet"}
              />
            </div>
          )}
          {!isLoading && (quotations as []).length > 0 && (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">RFQ</th>
                  <th className="text-left py-3 px-4 font-medium">Vendor</th>
                  <th className="text-right py-3 px-4 font-medium">Delivery</th>
                  <th className="text-right py-3 px-4 font-medium">Total Amount</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {(quotations as Array<{
                  id: string;
                  status: string;
                  totalAmount: number;
                  deliveryDays: number;
                  updatedAt: string;
                  rfq: { id: string; title: string };
                  vendor: { organizationName: string };
                }>).map((q) => (
                  <tr
                    key={q.id}
                    className="border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/app/quotations/${q.id}`)}
                  >
                    <td className="py-3 px-4 font-medium">{q.rfq.title}</td>
                    <td className="py-3 px-4">{q.vendor.organizationName}</td>
                    <td className="py-3 px-4 text-right">{q.deliveryDays} days</td>
                    <td className="py-3 px-4 text-right tabular-nums">{formatCurrency(q.totalAmount)}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge status={q.status} /></td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{formatDate(q.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
