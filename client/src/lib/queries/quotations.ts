import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../auth";

export function useQuotations() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["quotations"],
    queryFn: () => api.get("/quotations").then(r => r.data),
    enabled: !!accessToken,
  });
}

export function useQuotation(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["quotation", id],
    queryFn: () => api.get(`/quotations/${id}`).then(r => r.data),
    enabled: !!accessToken && !!id,
  });
}

export function useSubmitQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/quotations", data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["rfq-quotations"] });
    },
  });
}

export function useAcceptQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/quotations/${id}/accept`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rfq-quotations"] });
      qc.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
}

export function useRejectQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/quotations/${id}/reject`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rfq-quotations"] }),
  });
}
