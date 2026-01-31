import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api";
import type { RejectActionDto } from "../types";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useRejectAction() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: RejectActionDto) => orderApi.reject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", "waitingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      showToast("success", t("order.rejectSuccess"));
    },
    onError: (error: Error) => {
      showToast("error", error.message || t("order.rejectError"));
    },
  });
}
