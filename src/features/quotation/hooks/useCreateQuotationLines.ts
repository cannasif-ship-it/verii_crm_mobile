import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { CreateQuotationLineDto, QuotationLineDetailGetDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useCreateQuotationLines() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<
    QuotationLineDetailGetDto[],
    Error,
    { quotationId: number; body: CreateQuotationLineDto[] }
  >({
    mutationFn: ({ body }) => quotationApi.createQuotationLines(body),
    onSuccess: (_, { quotationId }) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", "lines", quotationId] });
      showToast("success", "Satırlar eklendi.");
    },
    onError: (error) => {
      showToast(
        "error",
        "Satırlar eklenemedi: " + (error.message ?? "Bilinmeyen hata."),
        10000
      );
    },
  });
}
