import { useQuery } from "@tanstack/react-query";
import { customer360Api, CUSTOMER_360_STALE_MS } from "../api";
import type { Customer360AnalyticsSummaryDto } from "../types";

export function useCustomer360AnalyticsSummary(
  customerId: number | undefined
): ReturnType<typeof useQuery<Customer360AnalyticsSummaryDto, Error>> {
  return useQuery<Customer360AnalyticsSummaryDto, Error>({
    queryKey: ["customer360", "analytics", "summary", customerId],
    queryFn: () => customer360Api.getAnalyticsSummary(customerId!),
    enabled: typeof customerId === "number" && customerId > 0,
    staleTime: CUSTOMER_360_STALE_MS,
  });
}
