import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../auth";

export function useRfqs(params?: Record<string, string>) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["rfqs", params],
    queryFn: () => api.get("/rfqs", { params }).then(r => r.data),
    enabled: !!accessToken,
  });
}

export function useRfq(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["rfq", id],
    queryFn: () => api.get(`/rfqs/${id}`).then(r => r.data),
    enabled: !!accessToken && !!id,
  });
}

export function useCreateRfq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/rfqs", data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rfqs"] }),
  });
}

export function useInviteVendors(rfqId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vendorIds: string[]) =>
      api.post(`/rfqs/${rfqId}/invite`, { vendorIds }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rfq", rfqId] }),
  });
}

export function useCloseRfq(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/rfqs/${id}/close`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rfqs"] });
      qc.invalidateQueries({ queryKey: ["rfq", id] });
    },
  });
}

export function useRfqQuotations(rfqId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["rfq-quotations", rfqId],
    queryFn: () => api.get(`/rfqs/${rfqId}/quotations`).then(r => r.data),
    enabled: !!accessToken && !!rfqId,
  });
}
