import { useQuery } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { UserDiscountLimitDto } from "../types";

export function useUserDiscountLimitsBySalesperson(salespersonId: number | undefined) {
  return useQuery<UserDiscountLimitDto[], Error>({
    queryKey: ["userDiscountLimit", "salesperson", salespersonId],
    queryFn: () => demandApi.getUserDiscountLimitsBySalesperson(salespersonId!),
    enabled: !!salespersonId && salespersonId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
