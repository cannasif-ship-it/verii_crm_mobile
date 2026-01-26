import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { ApproveActionDto } from "../types";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useApproveAction() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (data: ApproveActionDto) => quotationApi.approve(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "waitingApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["quotation"] });
      showToast("success", t("quotation.approveSuccess"));
    },
    onError: (error: Error) => {
      showToast("error", error.message || t("quotation.approveError"));
    },
  });
}
