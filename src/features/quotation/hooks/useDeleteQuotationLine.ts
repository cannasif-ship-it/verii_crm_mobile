import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import { useToastStore } from "../../../store/toast";

export function useDeleteQuotationLine() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<void, Error, { quotationId: number; lineId: number }>({
    mutationFn: ({ lineId }) => quotationApi.deleteQuotationLine(lineId),
    onSuccess: (_, { quotationId }) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", quotationId] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", "lines", quotationId] });
      showToast("success", "Satır silindi.");
    },
    onError: (error) => {
      showToast(
        "error",
        "Satır silinemedi: " + (error.message ?? "Bilinmeyen hata."),
        10000
      );
    },
  });
}
