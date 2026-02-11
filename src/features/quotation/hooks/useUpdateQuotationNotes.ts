import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { UpdateQuotationNotesListDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useUpdateQuotationNotes() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<void, Error, { quotationId: number; data: UpdateQuotationNotesListDto }>({
    mutationFn: ({ quotationId, data }) => quotationApi.updateQuotationNotesList(quotationId, data),
    onSuccess: (_, { quotationId }) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "notes", quotationId] });
      showToast("success", "Teklif notları kaydedildi.");
    },
    onError: (error) => {
      showToast("error", "Teklif notları kaydedilemedi: " + (error.message ?? "Bilinmeyen hata."), 5000);
    },
  });
}
