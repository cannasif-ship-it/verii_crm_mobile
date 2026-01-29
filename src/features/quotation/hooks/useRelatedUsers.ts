import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { ApprovalScopeUserDto } from "../types";

export function useRelatedUsers(userId: number | undefined) {
  return useQuery<ApprovalScopeUserDto[], Error>({
    queryKey: ["quotation", "related-users", userId],
    queryFn: () => quotationApi.getRelatedUsers(userId!),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
