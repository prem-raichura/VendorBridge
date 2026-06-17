import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRfq } from "@/lib/queries/rfqs";
import { useRfqQuotations } from "@/lib/queries/rfqs";
import { useAcceptQuotation, useRejectQuotation } from "@/lib/queries/quotations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { ArrowLeft, Star, CheckCircle, XCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

export function QuotationComparePage() {
  const { id: rfqId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rfq } = useRfq(rfqId!);
  const { data: quotations = [], isLoading } = useRfqQuotations(rfqId!);
  const acceptQuotation = useAcceptQuotation();
  const rejectQuotation = useRejectQuotation();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"accept" | "reject" | null>(null);

  const submitted = (quotations as Array<{ id: string; status: string; totalAmount: number; subAmount: number; gstTax: number; discount: number; deliveryDays: number; paymentTerms?: string; note?: string; vendor: { organizationName: string; rating?: number }; approval?: { decision: string } }>)
    .filter(q => q.status === "SUBMITTED");

  const lowestPrice = submitted.length > 0 ? Math.min(...submitted.map(q => q.totalAmount)) : 0;
  const fastestDelivery = submitted.length > 0 ? Math.min(...submitted.map(q => q.deliveryDays)) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compare Quotations</h1>
          <p className="text-muted-foreground text-sm">{rfq?.title}</p>
        </div>
      </div>

      {submitted.length === 0 && <EmptyState title="No submitted quotations" description="Vendors haven't submitted quotes yet" />}

      {submitted.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-3 border">Criteria</th>
                {submitted.map((q) => (
                  <th key={q.id} className="text-left p-3 border min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                        {q.vendor.organizationName[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{q.vendor.organizationName}</p>
                        {q.vendor.rating && <div className="flex items-center gap-1"><Star size={10} className="text-yellow-500 fill-yellow-500" /><span className="text-xs">{q.vendor.rating.toFixed(1)}</span></div>}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border text-muted-foreground font-medium">Sub Amount</td>
                {submitted.map(q => <td key={q.id} className="p-3 border">{formatCurrency(q.subAmount)}</td>)}
              </tr>
              <tr className="bg-muted/30">
                <td className="p-3 border text-muted-foreground font-medium">GST Tax</td>
                {submitted.map(q => <td key={q.id} className="p-3 border">{q.gstTax}%</td>)}
              </tr>
              <tr>
                <td className="p-3 border text-muted-foreground font-medium">Discount</td>
                {submitted.map(q => <td key={q.id} className="p-3 border">{q.discount}%</td>)}
              </tr>
              <tr className="bg-muted/30">
                <td className="p-3 border font-bold">Total Amount</td>
                {submitted.map(q => (
                  <td key={q.id} className={`p-3 border font-bold ${q.totalAmount === lowestPrice ? "text-green-600 bg-green-50" : ""}`}>
                    {q.totalAmount === lowestPrice && <Trophy size={12} className="inline mr-1 text-yellow-500" />}
                    {formatCurrency(q.totalAmount)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border text-muted-foreground font-medium">Delivery Days</td>
                {submitted.map(q => (
                  <td key={q.id} className={`p-3 border ${q.deliveryDays === fastestDelivery ? "text-green-600 font-semibold" : ""}`}>
                    {q.deliveryDays === fastestDelivery && "⚡ "}{q.deliveryDays} days
                  </td>
                ))}
              </tr>
              <tr className="bg-muted/30">
                <td className="p-3 border text-muted-foreground font-medium">Payment Terms</td>
                {submitted.map(q => <td key={q.id} className="p-3 border">{q.paymentTerms || "—"}</td>)}
              </tr>
              <tr>
                <td className="p-3 border text-muted-foreground font-medium">Note</td>
                {submitted.map(q => <td key={q.id} className="p-3 border text-xs">{q.note || "—"}</td>)}
              </tr>
              <tr>
                <td className="p-3 border text-muted-foreground font-medium">Status</td>
                {submitted.map(q => <td key={q.id} className="p-3 border"><StatusBadge status={q.status} /></td>)}
              </tr>
              <tr className="bg-muted/30">
                <td className="p-3 border font-medium">Action</td>
                {submitted.map(q => (
                  <td key={q.id} className="p-3 border">
                    {q.status === "SUBMITTED" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="gradient"
                          loading={pendingId === q.id && pendingAction === "accept"}
                          loadingText="Accepting..."
                          onClick={() => {
                            setPendingId(q.id); setPendingAction("accept");
                            acceptQuotation.mutate(q.id, {
                              onSuccess: () => toast.success("Quotation accepted, sent for approval"),
                              onError: () => toast.error("Failed to accept"),
                              onSettled: () => { setPendingId(null); setPendingAction(null); },
                            });
                          }}
                        >
                          <CheckCircle size={12} /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          loading={pendingId === q.id && pendingAction === "reject"}
                          loadingText="Rejecting..."
                          onClick={() => {
                            setPendingId(q.id); setPendingAction("reject");
                            rejectQuotation.mutate(q.id, {
                              onSuccess: () => toast.success("Quotation rejected"),
                              onError: () => toast.error("Failed to reject"),
                              onSettled: () => { setPendingId(null); setPendingAction(null); },
                            });
                          }}
                        >
                          <XCircle size={12} /> Reject
                        </Button>
                      </div>
                    ) : <StatusBadge status={q.status} />}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {(quotations as []).length > submitted.length && (
        <Card>
          <CardHeader><CardTitle className="text-sm">All Quotations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(quotations as Array<{ id: string; status: string; vendor: { organizationName: string }; totalAmount: number }>).map(q => (
              <div key={q.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm cursor-pointer hover:bg-muted/50 rounded px-2" onClick={() => navigate(`/app/quotations/${q.id}`)}>
                <span className="font-medium">{q.vendor.organizationName}</span>
                <div className="flex items-center gap-3">
                  <span>{formatCurrency(q.totalAmount)}</span>
                  <StatusBadge status={q.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
