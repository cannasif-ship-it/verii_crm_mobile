import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { quotationApi } from "../api";
import type { QuotationBulkCreateDto, QuotationGetDto, QuotationNotesDto } from "../types";
import { useToastStore } from "../../../store/toast";

function dtoToNotesArray(dto: QuotationNotesDto): string[] {
  const arr: string[] = [];
  for (let i = 1; i <= 15; i++) {
    const v = dto[`note${i}` as keyof QuotationNotesDto];
    if (typeof v === "string" && v.trim()) arr.push(v.trim());
  }
  return arr;
}

export function useCreateQuotationBulk() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<QuotationGetDto, Error, QuotationBulkCreateDto>({
    mutationFn: (data) => quotationApi.createBulk(data),
    onSuccess: async (data, variables) => {
      const notesDto = variables.quotationNotes;
      if (notesDto) {
        const notesArray = dtoToNotesArray(notesDto);
        if (notesArray.length > 0) {
          try {
            await quotationApi.updateQuotationNotesList(data.id, { notes: notesArray });
          } catch {
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["quotation", "list"] });
      showToast("success", "Teklif Başarıyla Oluşturuldu. Teklif onay sürecine gönderildi.");
      router.push(`/(tabs)/sales/quotations/${data.id}`);
    },
    onError: (error) => {
      showToast(
        "error",
        "Teklif Oluşturulamadı: " + (error.message || "Teklif oluşturulurken bir hata oluştu."),
        10000
      );
    },
  });
}
