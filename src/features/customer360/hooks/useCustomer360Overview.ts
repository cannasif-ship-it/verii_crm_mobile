import { useQuery } from "@tanstack/react-query";
import { customer360Api, CUSTOMER_360_STALE_MS } from "../api";
import type { Customer360OverviewDto } from "../types";

export function useCustomer360Overview(
  customerId: number | undefined
): ReturnType<typeof useQuery<Customer360OverviewDto, Error>> {
  return useQuery<Customer360OverviewDto, Error>({
    queryKey: ["customer360", "overview", customerId],
    queryFn: () => customer360Api.getOverview(customerId!),
    enabled: typeof customerId === "number" && customerId > 0,
    staleTime: CUSTOMER_360_STALE_MS,
  });
}
