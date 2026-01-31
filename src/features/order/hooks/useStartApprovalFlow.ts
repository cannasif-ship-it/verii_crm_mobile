import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useStartApprovalFlow() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const { t } = useTranslation();

  return useMutation<boolean, Error, number>({
    mutationFn: (orderId) => orderApi.startApprovalFlow(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", "list"] });
      queryClient.invalidateQueries({ queryKey: ["order", "detail", orderId] });
      queryClient.invalidateQueries({ queryKey: ["order", "waitingApprovals"] });
      showToast("success", t("order.sendForApprovalSuccess"));
    },
    onError: (error: Error) => {
      showToast("error", error.message || t("order.sendForApprovalError"), 10000);
    },
  });
}
