import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../auth";

export function useInvoices() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => api.get("/invoices").then(r => r.data),
    enabled: !!accessToken,
  });
}

export function useInvoice(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => api.get(`/invoices/${id}`).then(r => r.data),
    enabled: !!accessToken && !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poId: string) => api.post("/invoices", { poId }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useEmailInvoice(id: string) {
  return useMutation({
    mutationFn: (data: { to?: string; cc?: string; message?: string }) =>
      api.post(`/invoices/${id}/email`, data).then(r => r.data),
  });
}
