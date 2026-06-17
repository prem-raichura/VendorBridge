import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../auth";

const REPORT_ROLES = ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"];

function useReportsAccess() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  return !!accessToken && REPORT_ROLES.includes(role || "");
}

export function useSpendReport() {
  const enabled = useReportsAccess();
  return useQuery({
    queryKey: ["reports", "spend"],
    queryFn: () => api.get("/reports/spend").then(r => r.data),
    enabled,
    retry: false,
  });
}

export function useVendorPerformance() {
  const enabled = useReportsAccess();
  return useQuery({
    queryKey: ["reports", "vendor-performance"],
    queryFn: () => api.get("/reports/vendor-performance").then(r => r.data),
    enabled,
    retry: false,
  });
}

export function useMonthlyTrend() {
  const enabled = useReportsAccess();
  return useQuery({
    queryKey: ["reports", "monthly"],
    queryFn: () => api.get("/reports/monthly").then(r => r.data),
    enabled,
    retry: false,
  });
}
