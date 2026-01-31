import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { RejectActionDto } from "../types";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useRejectAction() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: RejectActionDto) => demandApi.reject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demand", "waitingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["demand"] });
      showToast("success", t("demand.rejectSuccess"));
    },
    onError: (error: Error) => {
      showToast("error", error.message || t("demand.rejectError"));
    },
  });
}
