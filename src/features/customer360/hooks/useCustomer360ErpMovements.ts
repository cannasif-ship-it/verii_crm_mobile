import { useQuery } from "@tanstack/react-query";
import {
  customer360Api,
  CUSTOMER_360_ERP_MOVEMENTS_STALE_MS,
} from "../api";
import type { Customer360ErpMovementDto } from "../types";

export function useCustomer360ErpMovements(
  customerId: number | undefined
): ReturnType<typeof useQuery<Customer360ErpMovementDto[], Error>> {
  return useQuery<Customer360ErpMovementDto[], Error>({
    queryKey: ["customer360", "erp-movements", customerId],
    queryFn: () => customer360Api.getErpMovements(customerId!),
    enabled: typeof customerId === "number" && customerId > 0,
    staleTime: CUSTOMER_360_ERP_MOVEMENTS_STALE_MS,
  });
}
