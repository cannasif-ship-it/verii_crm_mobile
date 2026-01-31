import { useQuery } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { PricingRuleLineGetDto } from "../types";

interface UsePriceRuleOfDemandParams {
  customerCode?: string;
  salesmenId?: number;
  demandDate?: string;
}

export function usePriceRuleOfDemand(params: UsePriceRuleOfDemandParams) {
  const { customerCode, salesmenId, demandDate } = params;

  return useQuery<PricingRuleLineGetDto[], Error>({
    queryKey: ["demand", "priceRule", params],
    queryFn: () =>
      demandApi.getPriceRuleOfDemand({
        customerCode: customerCode!,
        salesmenId: salesmenId!,
        demandDate: demandDate!,
      }),
    enabled: !!customerCode && !!salesmenId && !!demandDate,
    staleTime: 2 * 60 * 1000,
  });
}
