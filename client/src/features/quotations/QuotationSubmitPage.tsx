import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SubmitQuotationSchema } from "@/lib/schemas";
import { z } from "zod";
import { useSubmitQuotation } from "@/lib/queries/quotations";
import { useRfq } from "@/lib/queries/rfqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

type Form = z.infer<typeof SubmitQuotationSchema>;

export default function QuotationSubmitPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rfqId = params.get("rfq") || "";
  const { data: rfq } = useRfq(rfqId);
  const submitQuotation = useSubmitQuotation();
  const rfqItems = (rfq?.items || []) as Array<{ name: string; qty: number; unit: string }>;

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(SubmitQuotationSchema),
    defaultValues: {
      rfqId,
      items: rfqItems.map(i => ({ rfqItemRef: i.name, unitPrice: 0, qty: i.qty })),
      gstTax: 18, discount: 0, deliveryDays: 7,
    },
  });

  const { fields } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const gst = watch("gstTax") || 18;
  const discount = watch("discount") || 0;
  const subTotal = watchedItems?.reduce((s, i) => s + (i.unitPrice || 0) * (i.qty || 0), 0) || 0;
  const afterDiscount = subTotal - (subTotal * discount) / 100;
  const tax = (afterDiscount * gst) / 100;
  const total = afterDiscount + tax;

  const onSubmit = (data: Form, asDraft = false) => {
    submitQuotation.mutate({ ...data, asDraft } as Record<string, unknown>, {
      onSuccess: () => { toast.success(asDraft ? "Draft saved!" : "Quotation submitted!"); navigate("/app/quotations"); },
      onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed"),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submit Quotation</h1>
          <p className="text-muted-foreground text-sm">{rfq?.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end border rounded-lg p-3">
                <div className="col-span-5 space-y-1">
                  <Label className="text-xs">Item</Label>
                  <Input readOnly className="bg-muted" {...register(`items.${idx}.rfqItemRef`)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" {...register(`items.${idx}.qty`, { valueAsNumber: true })} />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">Unit Price (₹) *</Label>
                  <Input type="number" step="0.01" {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })} />
                </div>
                <div className="col-span-2 text-right text-sm pt-5 text-muted-foreground">
                  ₹{((watchedItems?.[idx]?.unitPrice || 0) * (watchedItems?.[idx]?.qty || 0)).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>GST % </Label>
              <Input type="number" step="0.01" {...register("gstTax", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Discount %</Label>
              <Input type="number" step="0.01" {...register("discount", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery Days *</Label>
              <Input type="number" {...register("deliveryDays", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Terms</Label>
              <Input placeholder="Net 30" {...register("paymentTerms")} />
            </div>
            <div className="col-span-2 p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between"><span>Sub Total</span><span>₹{subTotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Discount ({discount}%)</span><span>-₹{((subTotal * discount) / 100).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>GST ({gst}%)</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <Label>Notes</Label>
            <Textarea rows={3} className="mt-1.5" placeholder="Any additional notes or terms..." {...register("note")} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="gradient" loading={submitQuotation.isPending} loadingText="Submitting...">
            Submit Quotation
          </Button>
          <Button
            type="button"
            variant="outline"
            loading={submitQuotation.isPending}
            loadingText="Saving..."
            onClick={handleSubmit((d) => onSubmit(d, true))}
          >
            Save Draft
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
