import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { QuotationBulkCreateDto, QuotationGetDto } from "../types";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useUpdateQuotationBulk() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const { t } = useTranslation();

  return useMutation<
    QuotationGetDto,
    Error,
    { id: number; data: QuotationBulkCreateDto }
  >({
    mutationFn: ({ id, data }) => quotationApi.updateBulk(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["quotation", "list"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", "lines", id] });
      queryClient.invalidateQueries({ queryKey: ["quotation", "detail", "exchangeRates", id] });
      showToast("success", t("common.quotationUpdated"));
    },
    onError: (error) => {
      showToast(
        "error",
        `${t("common.quotationUpdateFailed")}: ${error.message ?? t("common.unknownError")}`,
        10000
      );
    },
  });
}
