import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../api";

export function useWaitingApprovals() {
  return useQuery({
    queryKey: ["order", "waitingApprovals"],
    queryFn: () => orderApi.getWaitingApprovals(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
