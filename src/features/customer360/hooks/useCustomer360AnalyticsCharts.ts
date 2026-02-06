import { useQuery } from "@tanstack/react-query";
import {
  customer360Api,
  CUSTOMER_360_CHARTS_STALE_MS,
} from "../api";
import type { Customer360AnalyticsChartsDto } from "../types";

export function useCustomer360AnalyticsCharts(
  customerId: number | undefined,
  months: number,
  currency: string | null
): ReturnType<typeof useQuery<Customer360AnalyticsChartsDto, Error>> {
  return useQuery<Customer360AnalyticsChartsDto, Error>({
    queryKey: [
      "customer360",
      "charts",
      customerId,
      months ?? 12,
      currency ?? "ALL",
    ],
    queryFn: () =>
      customer360Api.getAnalyticsCharts(customerId!, months ?? 12, currency),
    enabled: typeof customerId === "number" && customerId > 0,
    staleTime: CUSTOMER_360_CHARTS_STALE_MS,
  });
}
