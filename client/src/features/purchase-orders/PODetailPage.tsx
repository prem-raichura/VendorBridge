import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePurchaseOrder } from "@/lib/queries/purchaseOrders";
import { useCreateInvoice } from "@/lib/queries/invoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ArrowLeft, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";

export function PODetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: po, isLoading } = usePurchaseOrder(id!);
  const createInvoice = useCreateInvoice();

  if (isLoading) return <DetailSkeleton />;
  if (!po) return <p className="text-muted-foreground">Purchase order not found</p>;

  const isPO = ["PROCUREMENT_OFFICER", "ADMIN"].includes(user?.role || "");
  const items = po.quotation.items as Array<{ rfqItemRef: string; unitPrice: number; qty: number }>;
  const addr = po.vendor.address as Record<string, string> | null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{po.poNumber}</h1>
          <p className="text-muted-foreground text-sm">{po.quotation.rfq.title}</p>
        </div>
        <StatusBadge status={po.status} />
      </div>

      {isPO && !po.invoice && (
        <div className="flex gap-3">
          <Button
            variant="gradient"
            loading={createInvoice.isPending}
            loadingText="Generating..."
            onClick={() =>
              createInvoice.mutate(po.id, {
                onSuccess: (inv: { id: string }) => { toast.success("Invoice generated!"); navigate(`/app/invoices/${inv.id}`); },
                onError: () => toast.error("Failed to create invoice"),
              })
            }
          >
            <Receipt size={14} /> Generate Invoice
          </Button>
        </div>
      )}
      {po.invoice && (
        <Button variant="outline" onClick={() => navigate(`/app/invoices/${po.invoice.id}`)}>
          <Receipt size={14} /> View Invoice
        </Button>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Vendor Details</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="font-semibold">{po.vendor.organizationName}</p>
            {po.vendor.gstNo && <p className="text-muted-foreground">GST: {po.vendor.gstNo}</p>}
            {addr && <p className="text-muted-foreground">{[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Order Info</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">PO Number</span><span className="font-mono font-bold">{po.poNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDateTime(po.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created By</span><span>{po.createdBy.firstName} {po.createdBy.lastName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={po.status} /></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b"><tr className="text-muted-foreground"><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Unit Price</th><th className="text-right py-2">Total</th></tr></thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b last:border-0"><td className="py-2">{item.rfqItemRef}</td><td className="py-2 text-right">{item.qty}</td><td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td><td className="py-2 text-right font-medium">{formatCurrency(item.qty * item.unitPrice)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-3">
            <div className="text-right space-y-1 text-sm">
              <div className="flex gap-8 text-muted-foreground"><span>Sub Total</span><span>{formatCurrency(po.quotation.subAmount)}</span></div>
              <div className="flex gap-8 text-muted-foreground"><span>GST ({po.quotation.gstTax}%)</span><span>{formatCurrency((po.quotation.subAmount * po.quotation.gstTax) / 100)}</span></div>
              <div className="flex gap-8 font-bold text-base border-t pt-1"><span>Total</span><span>{formatCurrency(po.totalAmount)}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
