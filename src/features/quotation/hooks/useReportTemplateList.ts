import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { ReportTemplateGetDto, DocumentRuleTypeValue } from "../types";

const STALE_TIME_MS = 5 * 60 * 1000;

export function useReportTemplateList(ruleType: DocumentRuleTypeValue): {
  data: ReportTemplateGetDto[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["report-template", "list", ruleType],
    queryFn: () => quotationApi.getReportTemplates(),
    staleTime: STALE_TIME_MS,
  });

  const filtered = data.filter((t) => t.ruleType === ruleType && t.isActive);

  return {
    data: filtered,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
