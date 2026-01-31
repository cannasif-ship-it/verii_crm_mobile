import { useQuery } from "@tanstack/react-query";
import { demandApi } from "../api";

export function useWaitingApprovals() {
  return useQuery({
    queryKey: ["demand", "waitingApprovals"],
    queryFn: () => demandApi.getWaitingApprovals(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
