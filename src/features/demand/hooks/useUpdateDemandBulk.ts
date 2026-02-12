import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { DemandBulkCreateDto, DemandGetDto } from "../types";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useUpdateDemandBulk() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const { t } = useTranslation();

  return useMutation<
    DemandGetDto,
    Error,
    { id: number; data: DemandBulkCreateDto }
  >({
    mutationFn: ({ id, data }) => demandApi.updateBulk(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "list"] });
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", "lines", id] });
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", "exchangeRates", id] });
      showToast("success", t("common.demandUpdated"));
    },
    onError: (error) => {
      showToast(
        "error",
        `${t("common.demandUpdateFailed")}: ${error.message ?? t("common.unknownError")}`,
        10000
      );
    },
  });
}
