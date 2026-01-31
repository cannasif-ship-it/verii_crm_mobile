import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../api";
import type { UserDiscountLimitDto } from "../types";

export function useUserDiscountLimitsBySalesperson(salespersonId: number | undefined) {
  return useQuery<UserDiscountLimitDto[], Error>({
    queryKey: ["userDiscountLimit", "salesperson", salespersonId],
    queryFn: () => orderApi.getUserDiscountLimitsBySalesperson(salespersonId!),
    enabled: !!salespersonId && salespersonId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
