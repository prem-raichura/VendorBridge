import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useForgotPassword } from "@/lib/queries/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";
import { ArrowLeft } from "lucide-react";

export function ForgotPasswordPage() {
  const mutation = useForgotPassword();
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = (data: { email: string }) => {
    mutation.mutate(data, {
      onSuccess: () => toast.success("If that email exists, a reset link was sent"),
      onError: () => toast.error("Something went wrong"),
    });
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" placeholder="you@company.com" {...register("email")} />
        </div>
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          loading={mutation.isPending}
          loadingText="Sending link..."
        >
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
}
