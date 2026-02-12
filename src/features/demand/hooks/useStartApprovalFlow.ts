import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useStartApprovalFlow() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const { t } = useTranslation();

  return useMutation<boolean, Error, number>({
    mutationFn: (demandId) => demandApi.startApprovalFlow(demandId),
    onSuccess: (_, demandId) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "list"] });
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", demandId] });
      queryClient.invalidateQueries({ queryKey: ["demand", "waitingApprovals"] });
      showToast("success", t("common.demandApprovalFlowStarted"));
    },
    onError: (error) => {
      showToast(
        "error",
        `${t("common.approvalFlowStartError")}: ${error.message ?? t("common.unknownError")}`,
        10000
      );
    },
  });
}
