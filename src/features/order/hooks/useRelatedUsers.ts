import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../api";
import type { ApprovalScopeUserDto } from "../types";

export function useRelatedUsers(userId: number | undefined) {
  return useQuery<ApprovalScopeUserDto[], Error>({
    queryKey: ["order", "related-users", userId],
    queryFn: () => orderApi.getRelatedUsers(userId!),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
