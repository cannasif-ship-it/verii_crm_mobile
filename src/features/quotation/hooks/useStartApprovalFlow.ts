import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import { useToastStore } from "../../../store/toast";

export function useStartApprovalFlow() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<boolean, Error, number>({
    mutationFn: (quotationId) => quotationApi.startApprovalFlow(quotationId),
    onSuccess: (_, quotationId) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "list"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", quotationId] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "waitingApprovals"] });
      showToast("success", "Teklif onay sürecine gönderildi.");
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
