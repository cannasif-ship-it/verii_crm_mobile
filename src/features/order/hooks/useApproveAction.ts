import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api";
import type { ApproveActionDto } from "../types";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useApproveAction() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: ApproveActionDto) => orderApi.approve(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", "waitingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      showToast("success", t("order.approveSuccess"));
    },
    onError: (error: Error) => {
      showToast("error", error.message || t("order.approveError"));
    },
  });
}
