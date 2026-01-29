import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { QuotationBulkCreateDto, QuotationGetDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useUpdateQuotationBulk() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<
    QuotationGetDto,
    Error,
    { id: number; data: QuotationBulkCreateDto }
  >({
    mutationFn: ({ id, data }) => quotationApi.updateBulk(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "list"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", "lines", id] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", "exchangeRates", id] });
      showToast("success", "Teklif güncellendi.");
    },
    onError: (error) => {
      showToast(
        "error",
        "Teklif güncellenemedi: " + (error.message ?? "Bilinmeyen hata."),
        10000
      );
    },
  });
}
