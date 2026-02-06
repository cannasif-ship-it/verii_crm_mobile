import { useQuery } from "@tanstack/react-query";
import { customer360Api, CUSTOMER_360_STALE_MS } from "../api";
import type { Customer360AnalyticsChartsDto } from "../types";

export function useCustomer360AnalyticsCharts(
  customerId: number | undefined,
  months: number = 12
): ReturnType<typeof useQuery<Customer360AnalyticsChartsDto, Error>> {
  return useQuery<Customer360AnalyticsChartsDto, Error>({
    queryKey: ["customer360", "analytics", "charts", customerId, months],
    queryFn: () => customer360Api.getAnalyticsCharts(customerId!, months),
    enabled: typeof customerId === "number" && customerId > 0,
    staleTime: CUSTOMER_360_STALE_MS,
  });
}
