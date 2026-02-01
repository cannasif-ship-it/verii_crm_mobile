import { useQuery } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { DemandApprovalFlowReportDto } from "../types";

const STALE_TIME_MS = 60 * 1000;

export function useDemandApprovalFlowReport(
  demandId: number | undefined
): {
  data: DemandApprovalFlowReportDto | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["demand", "approval-flow-report", demandId],
    queryFn: () => demandApi.getApprovalFlowReport(demandId!),
    enabled: typeof demandId === "number",
    staleTime: STALE_TIME_MS,
  });

  return {
    data,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
