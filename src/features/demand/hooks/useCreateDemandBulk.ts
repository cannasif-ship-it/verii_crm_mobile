import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { demandApi } from "../api";
import type { DemandBulkCreateDto, DemandGetDto } from "../types";
import { useToastStore } from "../../../store/toast";

export function useCreateDemandBulk() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<DemandGetDto, Error, DemandBulkCreateDto>({
    mutationFn: (data) => demandApi.createBulk(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["demand", "list"] });
      showToast("success", "Talep Başarıyla Oluşturuldu. Talep onay sürecine gönderildi.");
      router.push(`/(tabs)/sales/demands/${data.id}`);
    },
    onError: (error) => {
      showToast(
        "error",
        "Talep Oluşturulamadı: " + (error.message || "Talep oluşturulurken bir hata oluştu."),
        10000
      );
    },
  });
}
