import React from "react";
import { motion } from "framer-motion";
import { useActivity } from "@/lib/queries/activity";
import { Card, CardContent } from "@/components/ui/card";
import { TimelineSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { timeAgo } from "@/lib/format";
import { Activity } from "lucide-react";

const ACTION_ICONS: Record<string, string> = {
  CREATED_RFQ: "📄", INVITED_VENDORS: "📩", SUBMITTED_QUOTATION: "💬", ACCEPTED_QUOTATION: "✅",
  REJECTED_QUOTATION: "❌", APPROVED_QUOTATION_PO_CREATED: "🛒", GENERATED_INVOICE: "🧾",
  EMAILED_INVOICE: "📧", CREATED_VENDOR: "🏢", UPDATED_VENDOR: "✏️",
};

export function ActivityTimelinePage() {
  const { data: logs = [], isLoading } = useActivity({ limit: "100" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity log</h1>
        <p className="text-muted-foreground text-sm mt-1">Full procurement activity timeline</p>
      </div>

      {isLoading && <TimelineSkeleton count={8} />}
      {!isLoading && (logs as []).length === 0 && <EmptyState title="No activity yet" />}

      <div className="relative">
        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />
        <div className="space-y-3">
          {(logs as Array<{
            id: string; action: string; entityType: string; entityId: string; createdAt: string;
            metadata?: Record<string, unknown>;
            user: { firstName: string; lastName: string; avatarUrl?: string }
          }>).map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex gap-3 pl-0 relative"
            >
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card border-2 border-card shadow-soft text-sm ring-2 ring-secondary">
                {ACTION_ICONS[log.action] || <Activity size={12} />}
              </div>
              <Card className="flex-1 hover:border-primary/30 transition-colors">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{log.action.replace(/_/g, " ").toLowerCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user.firstName} {log.user.lastName} • {log.entityType} #{log.entityId.slice(-6)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">{timeAgo(log.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
