import { useQuery } from "@tanstack/react-query";
import {
  customer360Api,
  CUSTOMER_360_ERP_BALANCE_STALE_MS,
} from "../api";
import type { Customer360ErpBalanceDto } from "../types";

export function useCustomer360ErpBalance(
  customerId: number | undefined
): ReturnType<typeof useQuery<Customer360ErpBalanceDto, Error>> {
  return useQuery<Customer360ErpBalanceDto, Error>({
    queryKey: ["customer360", "erp-balance", customerId],
    queryFn: () => customer360Api.getErpBalance(customerId!),
    enabled: typeof customerId === "number" && customerId > 0,
    staleTime: CUSTOMER_360_ERP_BALANCE_STALE_MS,
  });
}
