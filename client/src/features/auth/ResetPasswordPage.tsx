import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useResetPassword } from "@/lib/queries/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";
import { ArrowLeft } from "lucide-react";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mutation = useResetPassword();
  const { register, handleSubmit } = useForm<{ password: string }>();

  const onSubmit = (data: { password: string }) => {
    mutation.mutate(
      { token: params.get("token") || "", password: data.password },
      {
        onSuccess: () => { toast.success("Password reset!"); navigate("/login"); },
        onError: () => toast.error("Invalid or expired reset link"),
      }
    );
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Choose a new password for your account"
      footer={
        <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>New password</Label>
          <Input type="password" placeholder="At least 8 characters" {...register("password")} />
        </div>
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          loading={mutation.isPending}
          loadingText="Resetting..."
        >
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}
