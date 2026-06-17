import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRfq, useCloseRfq } from "@/lib/queries/rfqs";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/format";
import { ArrowLeft, GitCompareArrows, X } from "lucide-react";
import { toast } from "sonner";

export function RfqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: rfq, isLoading } = useRfq(id!);
  const closeRfq = useCloseRfq(id!);

  if (isLoading) return <DetailSkeleton />;
  if (!rfq) return <p className="text-muted-foreground">RFQ not found</p>;

  const isPO = ["PROCUREMENT_OFFICER", "ADMIN"].includes(user?.role || "");
  const items = rfq.items as Array<{ name: string; qty: number; unit: string; specs?: string }>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{rfq.title}</h1>
          <p className="text-muted-foreground text-sm">{rfq.category} • {formatDateTime(rfq.createdAt)}</p>
        </div>
        <StatusBadge status={rfq.status} />
      </div>

      {isPO && (
        <div className="flex gap-3">
          {rfq._count?.quotations > 0 && (
            <Button variant="gradient" onClick={() => navigate(`/app/rfqs/${id}/compare`)}>
              <GitCompareArrows size={14} /> Compare Quotations
            </Button>
          )}
          {rfq.status !== "CLOSED" && rfq.status !== "CANCELLED" && (
            <Button
              variant="outline"
              loading={closeRfq.isPending}
              loadingText="Closing..."
              onClick={() => closeRfq.mutate(undefined, { onSuccess: () => toast.success("RFQ closed") })}
            >
              <X size={14} /> Close RFQ
            </Button>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">RFQ Info</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Deadline</span><span className="font-medium">{formatDate(rfq.deadline)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created By</span><span>{rfq.createdBy.firstName} {rfq.createdBy.lastName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vendors Invited</span><span>{rfq.rfqVendors?.length || 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Quotations</span><span>{rfq._count?.quotations || 0}</span></div>
            {rfq.description && <div><p className="text-muted-foreground mb-1">Description</p><p>{rfq.description}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Invited Vendors</CardTitle></CardHeader>
          <CardContent>
            {rfq.rfqVendors?.length === 0 ? <p className="text-sm text-muted-foreground">No vendors invited yet</p> :
              (rfq.rfqVendors || []).map((rv: { vendor: { id: string; organizationName: string; category: string }; viewedAt?: string }) => (
                <div key={rv.vendor.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                  <div>
                    <p className="font-medium">{rv.vendor.organizationName}</p>
                    <p className="text-xs text-muted-foreground">{rv.vendor.category}</p>
                  </div>
                  {rv.viewedAt && <span className="text-xs text-green-600">Viewed</span>}
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Requested Items</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-muted-foreground">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-left py-2">Unit</th>
                  <th className="text-left py-2">Specs</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-2 font-medium">{item.name}</td>
                    <td className="py-2 text-right">{item.qty}</td>
                    <td className="py-2">{item.unit}</td>
                    <td className="py-2 text-muted-foreground">{item.specs || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
