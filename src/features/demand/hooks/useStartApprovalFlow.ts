import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import { useToastStore } from "../../../store/toast";

export function useStartApprovalFlow() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<boolean, Error, number>({
    mutationFn: (demandId) => demandApi.startApprovalFlow(demandId),
    onSuccess: (_, demandId) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "list"] });
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", demandId] });
      queryClient.invalidateQueries({ queryKey: ["demand", "waitingApprovals"] });
      showToast("success", "Talep onay sürecine gönderildi.");
    },
    onError: (error) => {
      showToast(
        "error",
        "Onay süreci başlatılamadı: " + (error.message ?? "Bilinmeyen hata."),
        10000
      );
    },
  });
}
