import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMe } from "@/lib/queries/auth";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

export function ProfilePage() {
  const { data: me, isLoading } = useMe();
  const { setUser } = useAuthStore();
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm({ values: me });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      for (const k of ["firstName", "lastName", "phone", "country", "bio"] as const) {
        const v = data[k];
        if (typeof v === "string" && v.trim() !== "") body[k] = v.trim();
      }
      const updated = await api.patch("/users/me", body).then(r => r.data);
      setUser(updated);
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <FormSkeleton rows={5} />
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-br from-secondary/40 to-secondary/10 border">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-odoo-500 to-odoo-700 grid place-items-center text-white text-2xl font-bold shadow-md">
                  {me?.firstName?.[0]}{me?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{me?.firstName} {me?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{me?.email}</p>
                  <div className="mt-1.5"><StatusBadge status={me?.role?.replace(/_/g, " ")} /></div>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>First Name</Label><Input {...register("firstName")} /></div>
                  <div className="space-y-1.5"><Label>Last Name</Label><Input {...register("lastName")} /></div>
                </div>
                <div className="space-y-1.5"><Label>Phone</Label><Input {...register("phone")} /></div>
                <div className="space-y-1.5"><Label>Country</Label><Input {...register("country")} /></div>
                <div className="space-y-1.5"><Label>Bio</Label><Textarea rows={3} {...register("bio")} /></div>
                <Button type="submit" variant="gradient" loading={saving} loadingText="Saving...">
                  Save Changes
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
