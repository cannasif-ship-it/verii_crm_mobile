import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { ApproveActionDto } from "../types";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useApproveAction() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: ApproveActionDto) => demandApi.approve(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demand", "waitingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["demand"] });
      showToast("success", t("demand.approveSuccess"));
    },
    onError: (error: Error) => {
      showToast("error", error.message || t("demand.approveError"));
    },
  });
}
