import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { demandApi } from "../api";
import type { DemandBulkCreateDto, DemandGetDto } from "../types";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useCreateDemandBulk() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { t } = useTranslation();

  return useMutation<DemandGetDto, Error, DemandBulkCreateDto>({
    mutationFn: (data) => demandApi.createBulk(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "list"] });
      showToast("success", t("common.demandCreatedAndSentForApproval"));
      router.push(`/(tabs)/sales/demands/${data.id}`);
    },
    onError: (error) => {
      showToast(
        "error",
        `${t("common.demandCreateFailed")}: ${error.message || t("common.demandCreateFailedGeneric")}`,
        10000
      );
    },
  });
}
