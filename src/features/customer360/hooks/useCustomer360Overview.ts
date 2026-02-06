import { useQuery } from "@tanstack/react-query";
import {
  customer360Api,
  CUSTOMER_360_OVERVIEW_STALE_MS,
} from "../api";
import type { Customer360OverviewDto } from "../types";

export function useCustomer360Overview(
  customerId: number | undefined,
  currency: string | null
): ReturnType<typeof useQuery<Customer360OverviewDto, Error>> {
  return useQuery<Customer360OverviewDto, Error>({
    queryKey: ["customer360", "overview", customerId, currency ?? "ALL"],
    queryFn: () => customer360Api.getOverview(customerId!, currency),
    enabled: typeof customerId === "number" && customerId > 0,
    staleTime: CUSTOMER_360_OVERVIEW_STALE_MS,
  });
}
