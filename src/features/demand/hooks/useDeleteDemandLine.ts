import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import { useToastStore } from "../../../store/toast";

export function useDeleteDemandLine() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<void, Error, { demandId: number; lineId: number }>({
    mutationFn: ({ lineId }) => demandApi.deleteDemandLine(lineId),
    onSuccess: (_, { demandId }) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", demandId] });
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", "lines", demandId] });
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
