import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../api";
import type { PricingRuleLineGetDto } from "../types";

interface UsePriceRuleOfOrderParams {
  customerCode?: string;
  salesmenId?: number;
  orderDate?: string;
}

export function usePriceRuleOfOrder(params: UsePriceRuleOfOrderParams) {
  const { customerCode, salesmenId, orderDate } = params;

  return useQuery<PricingRuleLineGetDto[], Error>({
    queryKey: ["order", "priceRule", params],
    queryFn: () =>
      orderApi.getPriceRuleOfOrder({
        customerCode: customerCode!,
        salesmenId: salesmenId!,
        orderDate: orderDate!,
      }),
    enabled: !!customerCode && !!salesmenId && !!orderDate,
    staleTime: 2 * 60 * 1000,
  });
}
