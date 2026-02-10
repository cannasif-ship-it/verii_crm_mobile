import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { activityTypeApi } from "../../activity";
import { useToastStore } from "../../../store/toast";
import type { ActivityTypeDto, CreateActivityTypeDto, UpdateActivityTypeDto } from "../types";

export function useCreateActivityType() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<ActivityTypeDto, Error, CreateActivityTypeDto>({
    mutationFn: activityTypeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activityType", "list"] });
      queryClient.invalidateQueries({ queryKey: ["activityType", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["activityType"] });
      showToast("success", t("activityType.createSuccess"));
    },
    onError: (error) => {
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}

export function useUpdateActivityType() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<
    ActivityTypeDto,
    Error,
    { id: number; data: UpdateActivityTypeDto }
  >({
    mutationFn: ({ id, data }) => activityTypeApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activityType", "list"] });
      queryClient.invalidateQueries({ queryKey: ["activityType", "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activityType", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["activityType"] });
      showToast("success", t("activityType.updateSuccess"));
    },
    onError: (error) => {
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}

export function useDeleteActivityType() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<void, Error, number>({
    mutationFn: activityTypeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activityType", "list"] });
      queryClient.invalidateQueries({ queryKey: ["activityType", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["activityType"] });
      showToast("success", t("activityType.deleteSuccess"));
    },
    onError: (error) => {
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}
