import { useQuery } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { ApprovalScopeUserDto } from "../types";

export function useRelatedUsers(userId: number | undefined) {
  return useQuery<ApprovalScopeUserDto[], Error>({
    queryKey: ["demand", "related-users", userId],
    queryFn: () => demandApi.getRelatedUsers(userId!),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
