import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/lib/queries/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";
import { ArrowRight, Mail, Lock } from "lucide-react";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type Form = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = (data: Form) => {
    login.mutate(data, {
      onSuccess: () => { toast.success("Welcome back!"); navigate("/app/dashboard"); },
      onError: (e: unknown) =>
        toast.error((e as { response?: { data?: { message?: string } } }).response?.data?.message || "Login failed"),
    });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your VendorBridge account"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
            <Input type="email" placeholder="you@company.com" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
            <Input type="password" placeholder="••••••••" className="pl-9" {...register("password")} />
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
        </div>
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full group"
          loading={login.isPending}
          loadingText="Signing in..."
        >
          Sign in
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </form>
      <div className="mt-5 p-3 rounded-xl border bg-secondary/40 text-xs">
        <p className="font-medium mb-1.5 text-secondary-foreground">Demo accounts</p>
        <div className="grid gap-0.5 text-muted-foreground font-mono">
          <p>admin@vendorbridge.com / Admin@1234</p>
          <p>officer@vendorbridge.com / Officer@1234</p>
          <p>manager@vendorbridge.com / Manager@1234</p>
          <p>vendor1@acme.com / Vendor@1234</p>
        </div>
      </div>
    </AuthLayout>
  );
}
