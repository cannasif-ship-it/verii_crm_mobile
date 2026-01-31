import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { DemandLineUpdateDto, DemandLineDetailGetDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useUpdateDemandLines() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<
    DemandLineDetailGetDto[],
    Error,
    { demandId: number; body: DemandLineUpdateDto[] }
  >({
    mutationFn: ({ body }) => demandApi.updateDemandLines(body),
    onSuccess: (_, { demandId }) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", "lines", demandId] });
      showToast("success", "Satırlar güncellendi.");
    },
    onError: (error) => {
      showToast(
        "error",
        "Talep satırları güncellenemedi: " + (error.message ?? "Bilinmeyen hata."),
        10000
      );
    },
  });
}
