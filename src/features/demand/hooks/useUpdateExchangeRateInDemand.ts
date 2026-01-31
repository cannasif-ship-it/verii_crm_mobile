import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { DemandExchangeRateUpdateDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useUpdateExchangeRateInDemand() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<boolean, Error, { demandId: number; body: DemandExchangeRateUpdateDto[] }>({
    mutationFn: ({ body }) => demandApi.updateExchangeRateInDemand(body),
    onSuccess: (_, { demandId }) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", "exchangeRates", demandId] });
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
