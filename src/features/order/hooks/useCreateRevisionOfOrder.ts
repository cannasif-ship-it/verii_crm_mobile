import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { orderApi } from "../api";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

export function useCreateRevisionOfOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (orderId: number) => orderApi.createRevision(orderId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["order", "orders"] });
      showToast("success", t("order.revisionSuccess"));
      router.push(`/(tabs)/sales/orders/${data.id}`);
    },
    onError: (error: Error) => {
      showToast("error", error.message || t("order.revisionError"));
    },
  });
}
