import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { QuotationExchangeRateUpdateDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useUpdateExchangeRateInQuotation() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<boolean, Error, { quotationId: number; body: QuotationExchangeRateUpdateDto[] }>({
    mutationFn: ({ body }) => quotationApi.updateExchangeRateInQuotation(body),
    onSuccess: (_, { quotationId }) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", "exchangeRates", quotationId] });
      showToast("success", "Döviz kurları güncellendi.");
    },
    onError: (error) => {
      showToast(
        "error",
        "Döviz kurları güncellenemedi: " + (error.message ?? "Bilinmeyen hata."),
        10000
      );
    },
  });
}
