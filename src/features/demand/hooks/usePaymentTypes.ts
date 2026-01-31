import { useQuery } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { PaymentTypeDto } from "../types";

export function usePaymentTypes() {
  return useQuery<PaymentTypeDto[], Error>({
    queryKey: ["paymentType", "list"],
    queryFn: () => demandApi.getPaymentTypes(),
    staleTime: 10 * 60 * 1000,
  });
}
