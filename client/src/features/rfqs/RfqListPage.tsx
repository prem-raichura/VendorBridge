import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRfqs } from "@/lib/queries/rfqs";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CardListSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/format";
import { Plus, Search, MessageSquareQuote, FileText } from "lucide-react";

export function RfqListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const { data: rfqs = [], isLoading } = useRfqs(search ? { search } : undefined);

  const isPO = ["PROCUREMENT_OFFICER", "ADMIN"].includes(user?.role || "");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RFQs</h1>
          <p className="text-muted-foreground text-sm mt-1">Request for Quotations</p>
        </div>
        {isPO && (
          <Button variant="gradient" onClick={() => navigate("/app/rfqs/new")}>
            <Plus size={16} /> Create RFQ
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
        <Input placeholder="Search RFQs..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading && <CardListSkeleton count={4} />}
      {!isLoading && (rfqs as []).length === 0 && (
        <EmptyState title="No RFQs found" description="Create your first RFQ to start procurement" />
      )}

      <div className="space-y-3">
        {(rfqs as Array<{
          id: string; title: string; category: string; status: string; deadline: string; createdAt: string;
          createdBy: { firstName: string; lastName: string };
          _count: { quotations: number; rfqVendors: number }
        }>).map((rfq, i) => (
          <motion.div
            key={rfq.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card
              className="cursor-pointer hover:shadow-soft hover:border-primary/30 transition-all group"
              onClick={() => navigate(`/app/rfqs/${rfq.id}`)}
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 items-start min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-odoo-50 text-odoo-700 grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{rfq.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rfq.category} • {rfq.createdBy.firstName} {rfq.createdBy.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Deadline: {formatDate(rfq.deadline)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={rfq.status} />
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{rfq._count.rfqVendors} vendors</span>
                      <span>{rfq._count.quotations} quotes</span>
                    </div>
                  </div>
                </div>
                {isPO && rfq._count.quotations > 0 && (
                  <div className="mt-3 pt-3 border-t flex gap-2" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/app/rfqs/${rfq.id}/compare`)}>
                      <MessageSquareQuote size={12} /> Compare Quotes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
