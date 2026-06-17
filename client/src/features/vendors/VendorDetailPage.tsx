import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useVendor } from "@/lib/queries/vendors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Star, Mail, Phone, MapPin, Building2 } from "lucide-react";

export function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useVendor(id!);

  if (isLoading) return <DetailSkeleton />;
  if (!vendor) return <p className="text-muted-foreground">Vendor not found</p>;

  const addr = vendor.address as Record<string, string> | null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-odoo-500 to-odoo-700 grid place-items-center text-white font-bold text-base shadow-md shrink-0">
          {vendor.organizationName[0] || <Building2 size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{vendor.organizationName}</h1>
          <p className="text-muted-foreground text-sm">{vendor.category}</p>
        </div>
        <StatusBadge status={vendor.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={14} />
              <span>{vendor.user.email}</span>
            </div>
            {vendor.user.phone && <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={14} /><span>{vendor.user.phone}</span>
            </div>}
            {addr && <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin size={14} className="mt-0.5" />
              <span>{[addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(", ")}</span>
            </div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {vendor.gstNo && <div className="flex justify-between"><span className="text-muted-foreground">GST No.</span><span className="font-mono">{vendor.gstNo}</span></div>}
            {vendor.rating && <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Rating</span>
              <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /><span className="font-medium">{vendor.rating.toFixed(1)}</span></div>
            </div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={vendor.status} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
