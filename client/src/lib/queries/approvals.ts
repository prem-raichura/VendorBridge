import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAuthStore } from "../auth";

const APPROVAL_ROLES = ["MANAGER", "ADMIN"];

function useApprovalAccess() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  return !!accessToken && APPROVAL_ROLES.includes(role || "");
}

export function useApprovals() {
  const enabled = useApprovalAccess();
  return useQuery({
    queryKey: ["approvals"],
    queryFn: () => api.get("/approvals").then(r => r.data),
    enabled,
    retry: false,
  });
}

export function usePendingApprovals() {
  const enabled = useApprovalAccess();
  return useQuery({
    queryKey: ["approvals", "pending"],
    queryFn: () => api.get("/approvals/pending").then(r => r.data),
    enabled,
    retry: false,
  });
}

export function useApproval(id: string) {
  const enabled = useApprovalAccess();
  return useQuery({
    queryKey: ["approval", id],
    queryFn: () => api.get(`/approvals/${id}`).then(r => r.data),
    enabled: enabled && !!id,
    retry: false,
  });
}

export function useDecideApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; decision: string; remarks?: string }) =>
      api.post(`/approvals/${id}/decide`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}
