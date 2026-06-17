import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { CreateVendorSchema } from "@/lib/schemas";
import { z } from "zod";
import { useCreateVendor } from "@/lib/queries/vendors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

type Form = z.infer<typeof CreateVendorSchema>;

export function VendorFormPage() {
  const navigate = useNavigate();
  const createVendor = useCreateVendor();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(CreateVendorSchema) });

  const onSubmit = (data: Form) => {
    createVendor.mutate(data as Record<string, unknown>, {
      onSuccess: (v: { id: string }) => { toast.success("Vendor created!"); navigate(`/app/vendors/${v.id}`); },
      onError: () => toast.error("Failed to create vendor"),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Vendor</h1>
          <p className="text-muted-foreground text-sm">Register a new vendor</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Vendor Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Organization Name *</Label>
              <Input {...register("organizationName")} />
              {errors.organizationName && <p className="text-xs text-destructive">{errors.organizationName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Input placeholder="e.g. IT Hardware, Software, Office Supplies" {...register("category")} />
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>GST Number</Label>
              <Input placeholder="27AABCU9603R1ZX" {...register("gstNo")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input {...register("address.city")} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input {...register("address.state")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Pincode</Label>
                <Input {...register("address.pincode")} />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input defaultValue="India" {...register("address.country")} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="gradient" loading={createVendor.isPending} loadingText="Creating...">
                Create Vendor
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
