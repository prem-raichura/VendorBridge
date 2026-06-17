import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInvoice, useEmailInvoice } from "@/lib/queries/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { PdfViewer } from "@/components/PdfViewer";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ArrowLeft, Download, Mail, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { DetailSkeleton } from "@/components/ui/skeleton";

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: invoice, isLoading } = useInvoice(id!);
  const emailInvoice = useEmailInvoice(id!);
  const [emailData, setEmailData] = useState({ to: "", cc: "", message: "" });
  const [emailOpen, setEmailOpen] = useState(false);
  const [pdfWorking, setPdfWorking] = useState<"print" | "download" | null>(null);

  if (isLoading) return <DetailSkeleton />;
  if (!invoice) return <p className="text-muted-foreground">Invoice not found</p>;

  const isPO = ["PROCUREMENT_OFFICER", "ADMIN"].includes(user?.role || "");

  const fetchPdfBlobUrl = async (): Promise<string> => {
    const res = await api.get(`/invoices/${id}/pdf`, { responseType: "blob" });
    return URL.createObjectURL(res.data);
  };

  const handlePrint = async () => {
    setPdfWorking("print");
    try {
      const url = await fetchPdfBlobUrl();
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error("Failed to open PDF");
    } finally {
      setPdfWorking(null);
    }
  };

  const handleDownload = async () => {
    setPdfWorking("download");
    try {
      const url = await fetchPdfBlobUrl();
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setPdfWorking(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground text-sm">{invoice.po.vendor.organizationName} • {formatDateTime(invoice.generatedAt)}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handlePrint} loading={pdfWorking === "print"} loadingText="Opening...">
          <Printer size={14} /> Print
        </Button>
        <Button variant="outline" onClick={handleDownload} loading={pdfWorking === "download"} loadingText="Downloading...">
          <Download size={14} /> Download PDF
        </Button>
        {isPO && (
          <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient"><Mail size={14} /> Email Invoice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Invoice</DialogTitle>
                <DialogDescription>
                  Send {invoice.invoiceNumber} as a PDF attachment to the vendor or another recipient.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>To *</Label>
                  <Input type="email" placeholder="vendor@example.com" value={emailData.to} onChange={e => setEmailData(p => ({ ...p, to: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>CC</Label>
                  <Input type="email" placeholder="cc@example.com" value={emailData.cc} onChange={e => setEmailData(p => ({ ...p, cc: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <Textarea rows={3} placeholder="Optional message..." value={emailData.message} onChange={e => setEmailData(p => ({ ...p, message: e.target.value }))} />
                </div>
                <Button
                  variant="gradient"
                  className="w-full"
                  loading={emailInvoice.isPending}
                  loadingText="Sending..."
                  onClick={() => {
                    emailInvoice.mutate(emailData, {
                      onSuccess: () => { toast.success("Invoice emailed!"); setEmailOpen(false); },
                      onError: () => toast.error("Failed to send email"),
                    });
                  }}
                >
                  Send Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader><CardTitle className="text-base">Invoice Summary</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(invoice.amount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(invoice.taxAmount)}</span></div>
            <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(invoice.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={invoice.status} /></div>
            {invoice.sentAt && <div className="flex justify-between"><span className="text-muted-foreground">Sent</span><span className="text-xs">{formatDateTime(invoice.sentAt)}</span></div>}
          </CardContent>
        </Card>
        <div className="col-span-2">
          <PdfViewer invoiceId={id!} />
        </div>
      </div>
    </div>
  );
}
