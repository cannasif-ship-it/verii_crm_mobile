import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { CreateDemandLineDto, DemandLineDetailGetDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useCreateDemandLines() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<
    DemandLineDetailGetDto[],
    Error,
    { demandId: number; body: CreateDemandLineDto[] }
  >({
    mutationFn: ({ body }) => demandApi.createDemandLines(body),
    onSuccess: (_, { demandId }) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", "lines", demandId] });
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
