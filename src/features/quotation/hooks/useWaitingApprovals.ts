import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";

export function useWaitingApprovals() {
  return useQuery({
    queryKey: ["quotation", "waitingApprovals"],
    queryFn: () => quotationApi.getWaitingApprovals(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
