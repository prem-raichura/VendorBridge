import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../auth";

const ACTIVITY_ROLES = ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"];

export function useActivity(params?: Record<string, string>) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const enabled = !!accessToken && ACTIVITY_ROLES.includes(role || "");
  return useQuery({
    queryKey: ["activity", params],
    queryFn: () => api.get("/activity", { params }).then(r => r.data),
    enabled,
    retry: false,
  });
}

export function useNotifications() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications").then(r => r.data),
    enabled: !!accessToken,
    refetchInterval: 30_000,
    retry: false,
  });
}
