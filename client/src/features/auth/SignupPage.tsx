import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { RegisterSchema } from "@/lib/schemas";
import { z } from "zod";
import { useRegister } from "@/lib/queries/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";
import { ArrowRight } from "lucide-react";

type Form = z.infer<typeof RegisterSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = (data: Form) => {
    registerMutation.mutate(data as Record<string, unknown>, {
      onSuccess: () => { toast.success("Account created!"); navigate("/app/dashboard"); },
      onError: (e: unknown) =>
        toast.error((e as { response?: { data?: { message?: string } } }).response?.data?.message || "Registration failed"),
    });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started with VendorBridge — free for 14 days"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input placeholder="Jane" {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input placeholder="Doe" {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Username</Label>
          <Input placeholder="janedoe" {...register("username")} />
          {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" placeholder="you@company.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input type="password" placeholder="At least 8 characters" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Select onValueChange={(v) => setValue("role", v as Form["role"])}>
            <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PROCUREMENT_OFFICER">Procurement Officer</SelectItem>
              <SelectItem value="MANAGER">Manager / Approver</SelectItem>
              <SelectItem value="VENDOR">Vendor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full group"
          loading={registerMutation.isPending}
          loadingText="Creating account..."
        >
          Create account
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </form>
    </AuthLayout>
  );
}
