import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { CreateRfqSchema } from "@/lib/schemas";
import { z } from "zod";
import { useCreateRfq } from "@/lib/queries/rfqs";
import { useVendors } from "@/lib/queries/vendors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

type Form = z.infer<typeof CreateRfqSchema>;

export function RfqCreatePage() {
  const navigate = useNavigate();
  const createRfq = useCreateRfq();
  const { data: vendors = [] } = useVendors();

  const { register, handleSubmit, control, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(CreateRfqSchema),
    defaultValues: { items: [{ name: "", qty: 1, unit: "pcs", specs: "" }], vendorIds: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const [selectedVendors, setSelectedVendors] = React.useState<string[]>([]);

  const onSubmit = (data: Form) => {
    createRfq.mutate({ ...data, vendorIds: selectedVendors } as Record<string, unknown>, {
      onSuccess: (rfq: { id: string }) => { toast.success("RFQ created!"); navigate(`/app/rfqs/${rfq.id}`); },
      onError: () => toast.error("Failed to create RFQ"),
    });
  };

  const toggleVendor = (id: string) =>
    setSelectedVendors(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create RFQ</h1>
          <p className="text-muted-foreground text-sm">Request for Quotation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>RFQ Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="e.g. Procurement of Laptops Q3 2026" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Input placeholder="IT Hardware" {...register("category")} />
              </div>
              <div className="space-y-1.5">
                <Label>Deadline *</Label>
                <Input type="datetime-local" {...register("deadline")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} {...register("description")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={() => append({ name: "", qty: 1, unit: "pcs", specs: "" })}>
                <Plus size={14} /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start border rounded-lg p-3">
                <div className="col-span-5 space-y-1">
                  <Label className="text-xs">Item Name *</Label>
                  <Input placeholder="Laptop 16GB RAM" {...register(`items.${idx}.name`)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Qty *</Label>
                  <Input type="number" min={1} {...register(`items.${idx}.qty`, { valueAsNumber: true })} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Unit *</Label>
                  <Input placeholder="pcs" {...register(`items.${idx}.unit`)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Specs</Label>
                  <Input placeholder="Core i7..." {...register(`items.${idx}.specs`)} />
                </div>
                <div className="col-span-1 pt-6">
                  {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}><Trash2 size={14} /></Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Invite Vendors</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">Select vendors to invite (optional — can invite later)</p>
            <div className="grid grid-cols-2 gap-2">
              {(vendors as Array<{ id: string; organizationName: string; category: string; status: string }>)
                .filter(v => v.status === "ACTIVE")
                .map(vendor => (
                  <label key={vendor.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${selectedVendors.includes(vendor.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                    <input type="checkbox" className="accent-primary" checked={selectedVendors.includes(vendor.id)} onChange={() => toggleVendor(vendor.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{vendor.organizationName}</p>
                      <p className="text-xs text-muted-foreground">{vendor.category}</p>
                    </div>
                  </label>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="gradient" loading={createRfq.isPending} loadingText="Creating RFQ...">
            Create RFQ
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
