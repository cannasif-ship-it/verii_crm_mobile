import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import { useToastStore } from "../../../store/toast";

export type StartApprovalFlowPayload = {
  entityId: number;
  documentType: number;
  totalAmount: number;
};

export function useStartApprovalFlow() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<boolean, Error, StartApprovalFlowPayload>({
    mutationFn: (data) => quotationApi.startApprovalFlow(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "list"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", variables.entityId] });
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
