import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { DemandBulkCreateDto, DemandGetDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useUpdateDemandBulk() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<
    DemandGetDto,
    Error,
    { id: number; data: DemandBulkCreateDto }
  >({
    mutationFn: ({ id, data }) => demandApi.updateBulk(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "list"] });
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", "lines", id] });
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", "exchangeRates", id] });
      showToast("success", "Talep güncellendi.");
    },
    onError: (error) => {
      showToast(
        "error",
        "Talep güncellenemedi: " + (error.message ?? "Bilinmeyen hata."),
        10000
      );
    },
  });
}
