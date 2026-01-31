import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../api";
import type { PaymentTypeDto } from "../types";

export function usePaymentTypes() {
  return useQuery<PaymentTypeDto[], Error>({
    queryKey: ["paymentType", "list"],
    queryFn: () => orderApi.getPaymentTypes(),
    staleTime: 10 * 60 * 1000,
  });
}
