import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../auth";

export function usePurchaseOrders() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => api.get("/purchase-orders").then(r => r.data),
    enabled: !!accessToken,
  });
}

export function usePurchaseOrder(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["purchase-order", id],
    queryFn: () => api.get(`/purchase-orders/${id}`).then(r => r.data),
    enabled: !!accessToken && !!id,
  });
}
