import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { QuotationLineUpdateDto, QuotationLineDetailGetDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useUpdateQuotationLines() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<
    QuotationLineDetailGetDto[],
    Error,
    { quotationId: number; body: QuotationLineUpdateDto[] }
  >({
    mutationFn: ({ body }) => quotationApi.updateQuotationLines(body),
    onSuccess: (_, { quotationId }) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", "lines", quotationId] });
      showToast("success", "Satırlar güncellendi.");
    },
    onError: (error) => {
      showToast(
        "error",
        "Teklif satırları güncellenemedi: " + (error.message ?? "Bilinmeyen hata."),
        10000
      );
    },
  });
}
