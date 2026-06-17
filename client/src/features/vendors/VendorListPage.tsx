import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useVendors, useToggleVendorStatus } from "@/lib/queries/vendors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CardListSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Search, Star, ToggleLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";

export function VendorListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const { data: vendors = [], isLoading } = useVendors(search ? { search } : undefined);
  const toggleStatus = useToggleVendorStatus();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage vendor registry</p>
        </div>
        <Button variant="gradient" onClick={() => navigate("/app/vendors/new")}>
          <Plus size={16} /> Add Vendor
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-8"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <CardListSkeleton count={6} />}
      {!isLoading && (vendors as []).length === 0 && (
        <EmptyState title="No vendors found" description="Add your first vendor to get started" />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(vendors as Array<{
          id: string; organizationName: string; category: string; gstNo?: string;
          status: string; rating?: number;
          user: { firstName: string; lastName: string; email: string }
        }>).map((vendor, i) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
          >
            <Card
              className="cursor-pointer hover:shadow-soft hover:border-primary/30 transition-all group h-full"
              onClick={() => navigate(`/app/vendors/${vendor.id}`)}
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-odoo-500 to-odoo-700 grid place-items-center text-white font-bold text-base shadow-md group-hover:scale-110 transition-transform">
                    {vendor.organizationName[0]}
                  </div>
                  <StatusBadge status={vendor.status} />
                </div>
                <h3 className="font-semibold truncate">{vendor.organizationName}</h3>
                <p className="text-sm text-muted-foreground">{vendor.category}</p>
                {vendor.gstNo && <p className="text-xs text-muted-foreground mt-1 font-mono">GST: {vendor.gstNo}</p>}
                {vendor.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{vendor.rating.toFixed(1)}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2 truncate">{vendor.user.email}</p>
                {isAdmin && (
                  <div className="flex gap-2 mt-3 pt-3 border-t" onClick={e => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={toggleStatus.isPending && toggleStatus.variables?.id === vendor.id}
                      onClick={() => {
                        const newStatus = vendor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                        toggleStatus.mutate({ id: vendor.id, status: newStatus }, {
                          onSuccess: () => toast.success(`Vendor ${newStatus.toLowerCase()}`),
                        });
                      }}
                    >
                      <ToggleLeft size={12} /> Toggle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
