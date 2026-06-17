import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../auth";

export function useLogin() {
  const { setAccessToken, setUser } = useAuthStore();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => api.post("/auth/login", data).then(r => r.data),
    onSuccess: (data) => { setAccessToken(data.accessToken); setUser(data.user); },
  });
}

export function useRegister() {
  const { setAccessToken, setUser } = useAuthStore();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/auth/register", data).then(r => r.data),
    onSuccess: (data) => { setAccessToken(data.accessToken); setUser(data.user); },
  });
}

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/users/me").then(r => r.data),
    enabled: !!accessToken,
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (data: { email: string }) => api.post("/auth/forgot-password", data).then(r => r.data) });
}

export function useResetPassword() {
  return useMutation({ mutationFn: (data: { token: string; password: string }) => api.post("/auth/reset-password", data).then(r => r.data) });
}
