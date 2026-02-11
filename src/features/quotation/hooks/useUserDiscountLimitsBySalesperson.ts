import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { UserDiscountLimitDto } from "../types";

export function useUserDiscountLimitsBySalesperson(salespersonId: number | undefined) {
  return useQuery<UserDiscountLimitDto[], Error>({
    queryKey: ["userDiscountLimit", "salesperson", salespersonId],
    queryFn: () => quotationApi.getUserDiscountLimitsBySalesperson(salespersonId!),
    enabled: !!salespersonId && salespersonId > 0,
    staleTime: 10 * 60 * 1000,
  });
}
