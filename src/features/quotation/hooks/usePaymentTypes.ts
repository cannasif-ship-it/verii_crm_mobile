import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { PaymentTypeDto } from "../types";

export function usePaymentTypes() {
  return useQuery<PaymentTypeDto[], Error>({
    queryKey: ["paymentType", "list"],
    queryFn: () => quotationApi.getPaymentTypes(),
    staleTime: 10 * 60 * 1000,
  });
}
