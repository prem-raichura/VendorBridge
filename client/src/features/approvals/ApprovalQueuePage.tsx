import React from "react";
import { useNavigate } from "react-router-dom";
import { useApprovals, usePendingApprovals } from "@/lib/queries/approvals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { CheckCircle, Clock } from "lucide-react";

export default function ApprovalQueuePage() {
  const navigate = useNavigate();
  const { data: pending = [], isLoading: pendingLoading } = usePendingApprovals();
  const { data: all = [], isLoading: allLoading } = useApprovals();
  const decided = (all as Array<{ id: string; decision: string }>).filter(a => a.decision !== "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and approve procurement requests</p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center gap-2">
          <span className="h-7 w-7 rounded-md bg-amber-100 text-amber-700 grid place-items-center shrink-0">
            <Clock size={14} />
          </span>
          <CardTitle className="text-lg">Pending ({(pending as []).length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {pendingLoading && <TableSkeleton rows={3} cols={6} />}
          {!pendingLoading && (pending as []).length === 0 && (
            <div className="py-8"><EmptyState title="No pending approvals" description="All caught up!" /></div>
          )}
          {!pendingLoading && (pending as []).length > 0 && (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">RFQ</th>
                  <th className="text-left py-3 px-4 font-medium">Vendor</th>
                  <th className="text-right py-3 px-4 font-medium">Delivery</th>
                  <th className="text-right py-3 px-4 font-medium">Total Amount</th>
                  <th className="text-right py-3 px-4 font-medium">Date</th>
                  <th className="text-center py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(pending as Array<{
                  id: string; decision: string; createdAt: string;
                  quotation: { totalAmount: number; deliveryDays: number; rfq: { title: string; category: string }; vendor: { organizationName: string } };
                  approver: { firstName: string; lastName: string }
                }>).map((a) => (
                  <tr
                    key={a.id}
                    className="border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/app/approvals/${a.id}`)}
                  >
                    <td className="py-3 px-4 font-medium">{a.quotation.rfq.title}</td>
                    <td className="py-3 px-4">{a.quotation.vendor.organizationName}</td>
                    <td className="py-3 px-4 text-right">{a.quotation.deliveryDays} days</td>
                    <td className="py-3 px-4 text-right tabular-nums">{formatCurrency(a.quotation.totalAmount)}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{formatDateTime(a.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <Button size="sm" variant="gradient" className="h-7 text-xs px-3">Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center gap-2">
          <span className="h-7 w-7 rounded-md bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
            <CheckCircle size={14} />
          </span>
          <CardTitle className="text-lg">Decided ({decided.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {allLoading && <TableSkeleton rows={3} cols={4} />}
          {!allLoading && decided.length === 0 && (
            <div className="py-8"><p className="text-sm text-center text-muted-foreground">No decided approvals yet.</p></div>
          )}
          {!allLoading && decided.length > 0 && (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">RFQ</th>
                  <th className="text-left py-3 px-4 font-medium">Vendor</th>
                  <th className="text-right py-3 px-4 font-medium">Total Amount</th>
                  <th className="text-center py-3 px-4 font-medium">Decision</th>
                </tr>
              </thead>
              <tbody>
                {(decided as Array<{ id: string; decision: string; quotation: { totalAmount: number; rfq: { title: string }; vendor: { organizationName: string } }; decidedAt?: string }>)
                  .slice(0, 10).map((a) => (
                    <tr
                      key={a.id}
                      className="border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/app/approvals/${a.id}`)}
                    >
                      <td className="py-3 px-4 font-medium">{a.quotation.rfq.title}</td>
                      <td className="py-3 px-4">{a.quotation.vendor.organizationName}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{formatCurrency(a.quotation.totalAmount)}</td>
                      <td className="py-3 px-4 text-center"><StatusBadge status={a.decision} /></td>
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
