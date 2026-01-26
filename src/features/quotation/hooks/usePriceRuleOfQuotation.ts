import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { PricingRuleLineGetDto } from "../types";

interface UsePriceRuleOfQuotationParams {
  customerCode?: string;
  salesmenId?: number;
  quotationDate?: string;
}

export function usePriceRuleOfQuotation(params: UsePriceRuleOfQuotationParams) {
  const { customerCode, salesmenId, quotationDate } = params;

  return useQuery<PricingRuleLineGetDto[], Error>({
    queryKey: ["quotation", "priceRule", params],
    queryFn: () =>
      quotationApi.getPriceRuleOfQuotation({
        customerCode: customerCode!,
        salesmenId: salesmenId!,
        quotationDate: quotationDate!,
      }),
    enabled: !!customerCode && !!salesmenId && !!quotationDate,
    staleTime: 2 * 60 * 1000,
  });
}
