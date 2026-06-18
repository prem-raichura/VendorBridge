import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuotation } from "@/lib/queries/quotations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: q, isLoading } = useQuotation(id!);

  if (isLoading) return <DetailSkeleton />;
  if (!q) return <p className="text-muted-foreground">Quotation not found</p>;

  const items = q.items as Array<{ rfqItemRef: string; unitPrice: number; qty: number }>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{q.rfq.title}</h1>
          <p className="text-muted-foreground text-sm">Quotation from {q.vendor.organizationName}</p>
        </div>
        <StatusBadge status={q.status} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-muted-foreground"><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Unit Price</th><th className="text-right py-2">Total</th></tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{item.rfqItemRef}</td>
                  <td className="py-2 text-right">{item.qty}</td>
                  <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(item.qty * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-1 text-sm border-t pt-3">
            <div className="flex justify-between text-muted-foreground"><span>Sub Total</span><span>{formatCurrency(q.subAmount)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>GST ({q.gstTax}%)</span><span>{formatCurrency((q.subAmount * q.gstTax) / 100)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(q.totalAmount)}</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Terms</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{q.deliveryDays} days</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{q.paymentTerms || "—"}</span></div>
            {q.submittedAt && <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span>{formatDateTime(q.submittedAt)}</span></div>}
            {q.note && <div><p className="text-muted-foreground mb-1">Note</p><p>{q.note}</p></div>}
          </CardContent>
        </Card>

        {q.approval && (
          <Card>
            <CardHeader><CardTitle className="text-base">Approval</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Decision</span><StatusBadge status={q.approval.decision} /></div>
              {q.approval.remarks && <div><p className="text-muted-foreground mb-1">Remarks</p><p>{q.approval.remarks}</p></div>}
              {q.approval.approver && <div className="flex justify-between"><span className="text-muted-foreground">Approver</span><span>{q.approval.approver.firstName} {q.approval.approver.lastName}</span></div>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
