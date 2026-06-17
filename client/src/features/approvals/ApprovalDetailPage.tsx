import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApproval, useDecideApproval } from "@/lib/queries/approvals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: approval, isLoading } = useApproval(id!);
  const decide = useDecideApproval();
  const [remarks, setRemarks] = useState("");
  const [pendingDecision, setPendingDecision] = useState<"APPROVED" | "REJECTED" | null>(null);

  if (isLoading) return <DetailSkeleton />;
  if (!approval) return <p className="text-muted-foreground">Approval not found</p>;

  const q = approval.quotation;
  const items = q.items as Array<{ rfqItemRef: string; unitPrice: number; qty: number }>;

  const handleDecide = (decision: "APPROVED" | "REJECTED") => {
    setPendingDecision(decision);
    decide.mutate(
      { id: id!, decision, remarks },
      {
        onSuccess: () => {
          toast.success(decision === "APPROVED" ? "Approved! PO created." : "Rejected.");
          navigate("/app/approvals");
        },
        onError: () => toast.error("Failed to record decision"),
        onSettled: () => setPendingDecision(null),
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Approval Review</h1>
          <p className="text-muted-foreground text-sm">{q.rfq.title}</p>
        </div>
        <StatusBadge status={approval.decision} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Vendor</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="font-semibold">{q.vendor.organizationName}</p>
            {q.vendor.rating && <p className="text-muted-foreground">Rating: ⭐ {q.vendor.rating}</p>}
            <p className="font-bold text-lg">{formatCurrency(q.totalAmount)}</p>
            <p className="text-muted-foreground">{q.deliveryDays} days delivery</p>
            {q.paymentTerms && <p className="text-muted-foreground">{q.paymentTerms}</p>}
            {q.note && <p className="text-sm mt-2 p-2 bg-muted rounded">{q.note}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">RFQ Details</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="font-medium">{q.rfq.title}</p>
            <p className="text-muted-foreground">{q.rfq.category}</p>
            {approval.decidedAt && <p className="text-muted-foreground">Decided: {formatDateTime(approval.decidedAt)}</p>}
            {approval.remarks && <div className="p-2 bg-muted rounded"><p className="text-xs text-muted-foreground mb-1">Remarks</p><p>{approval.remarks}</p></div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b"><tr className="text-muted-foreground"><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Unit Price</th><th className="text-right py-2">Total</th></tr></thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b last:border-0"><td className="py-2">{item.rfqItemRef}</td><td className="py-2 text-right">{item.qty}</td><td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td><td className="py-2 text-right">{formatCurrency(item.qty * item.unitPrice)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-3 font-bold">Total: {formatCurrency(q.totalAmount)}</div>
        </CardContent>
      </Card>

      {approval.decision === "PENDING" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Decision</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Remarks (optional)</Label>
              <Textarea rows={3} placeholder="Add remarks or conditions..." value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft"
                onClick={() => handleDecide("APPROVED")}
                disabled={decide.isPending}
                loading={pendingDecision === "APPROVED"}
                loadingText="Approving..."
              >
                <CheckCircle size={14} /> Approve & Generate PO
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDecide("REJECTED")}
                disabled={decide.isPending}
                loading={pendingDecision === "REJECTED"}
                loadingText="Rejecting..."
              >
                <XCircle size={14} /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
