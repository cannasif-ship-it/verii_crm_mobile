import { useMutation, useQueryClient } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { CreateDemandLineDto, DemandLineDetailGetDto } from "../types";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useCreateDemandLines() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const { t } = useTranslation();

  return useMutation<
    DemandLineDetailGetDto[],
    Error,
    { demandId: number; body: CreateDemandLineDto[] }
  >({
    mutationFn: ({ body }) => demandApi.createDemandLines(body),
    onSuccess: (_, { demandId }) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "detail", "lines", demandId] });
      showToast("success", t("common.rowsAdded"));
    },
    onError: (error) => {
      showToast(
        "error",
        `${t("common.rowsAddFailed")}: ${error.message ?? t("common.unknownError")}`,
        10000
      );
    },
  });
}
