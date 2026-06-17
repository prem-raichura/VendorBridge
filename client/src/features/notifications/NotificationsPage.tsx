import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNotifications } from "@/lib/queries/activity";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimelineSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { timeAgo } from "@/lib/format";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const qc = useQueryClient();
  const [marking, setMarking] = useState(false);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await api.patch("/notifications/read-all");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark notifications");
    } finally {
      setMarking(false);
    }
  };

  const unread = (notifications as Array<{ readAt: string | null }>).filter(n => !n.readAt).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">{unread} unread</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" loading={marking} loadingText="Marking..." onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      {isLoading && <TimelineSkeleton count={6} />}
      {!isLoading && (notifications as []).length === 0 && <EmptyState title="No notifications" />}

      <div className="space-y-2">
        {(notifications as Array<{ id: string; title: string; body: string; type: string; readAt: string | null; createdAt: string }>).map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className={n.readAt ? "opacity-65" : "border-primary/30 shadow-soft"}>
              <CardContent className="py-3 px-4 flex items-start gap-3">
                <div className={`mt-0.5 p-1.5 rounded-full ${n.readAt ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                  <Bell size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
