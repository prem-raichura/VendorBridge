import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApprovals, usePendingApprovals } from "@/lib/queries/approvals";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardListSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";

export function ApprovalQueuePage() {
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

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="h-7 w-7 rounded-md bg-amber-100 text-amber-700 grid place-items-center">
              <Clock size={14} />
            </span>
            Pending ({(pending as []).length})
          </h2>
          {pendingLoading && <CardListSkeleton count={2} />}
          {!pendingLoading && (pending as []).length === 0 && (
            <EmptyState title="No pending approvals" description="All caught up!" />
          )}
          <div className="space-y-3">
            {(pending as Array<{
              id: string; decision: string; createdAt: string;
              quotation: { totalAmount: number; deliveryDays: number; rfq: { title: string; category: string }; vendor: { organizationName: string } };
              approver: { firstName: string; lastName: string }
            }>).map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card
                  className="cursor-pointer hover:shadow-soft hover:border-primary/30 transition-all"
                  onClick={() => navigate(`/app/approvals/${a.id}`)}
                >
                  <CardContent className="pt-5 space-y-2">
                    <div className="flex justify-between items-start gap-3">
                      <p className="font-semibold text-sm">{a.quotation.rfq.title}</p>
                      <StatusBadge status={a.decision} />
                    </div>
                    <p className="text-sm text-muted-foreground">{a.quotation.vendor.organizationName}</p>
                    <p className="font-bold tabular-nums">{formatCurrency(a.quotation.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.quotation.deliveryDays} days • {formatDateTime(a.createdAt)}
                    </p>
                    <Button size="sm" variant="gradient" className="w-full mt-2 group">
                      Review
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="h-7 w-7 rounded-md bg-emerald-100 text-emerald-700 grid place-items-center">
              <CheckCircle size={14} />
            </span>
            Decided ({decided.length})
          </h2>
          {allLoading && <CardListSkeleton count={2} />}
          <div className="space-y-3">
            {(decided as Array<{ id: string; decision: string; quotation: { totalAmount: number; rfq: { title: string }; vendor: { organizationName: string } }; decidedAt?: string }>)
              .slice(0, 10).map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card
                    className="cursor-pointer opacity-80 hover:opacity-100 hover:border-primary/30 transition-all"
                    onClick={() => navigate(`/app/approvals/${a.id}`)}
                  >
                    <CardContent className="pt-5 space-y-1">
                      <div className="flex justify-between items-start gap-3">
                        <p className="font-semibold text-sm">{a.quotation.rfq.title}</p>
                        <StatusBadge status={a.decision} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {a.quotation.vendor.organizationName} • {formatCurrency(a.quotation.totalAmount)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
