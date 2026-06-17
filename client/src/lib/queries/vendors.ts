import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../auth";

export function useVendors(params?: Record<string, string>) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["vendors", params],
    queryFn: () => api.get("/vendors", { params }).then(r => r.data),
    enabled: !!accessToken,
  });
}

export function useVendor(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: () => api.get(`/vendors/${id}`).then(r => r.data),
    enabled: !!accessToken && !!id,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/vendors", data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useUpdateVendor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.patch(`/vendors/${id}`, data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendors"] }); qc.invalidateQueries({ queryKey: ["vendor", id] }); },
  });
}

export function useToggleVendorStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/vendors/${id}/status`, { status }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vendors/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}
