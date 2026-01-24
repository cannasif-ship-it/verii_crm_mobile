import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { activityApi } from "../api";
import { useToastStore } from "../../../store/toast";
import type { CreateActivityDto, UpdateActivityDto, ActivityDto, PagedResponse } from "../types";

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<ActivityDto, Error, CreateActivityDto>({
    mutationFn: activityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity", "list"] });
      showToast("success", t("activity.createSuccess"));
    },
    onError: (error) => {
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<ActivityDto, Error, { id: number; data: UpdateActivityDto }>({
    mutationFn: ({ id, data }) => activityApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["activity", "detail", id] });
      const previousData = queryClient.getQueryData<ActivityDto>(["activity", "detail", id]);
      if (previousData) {
        queryClient.setQueryData<ActivityDto>(["activity", "detail", id], {
          ...previousData,
          ...data,
        });
      }
      return { previousData };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activity", "list"] });
      queryClient.invalidateQueries({ queryKey: ["activity", "detail", variables.id] });
      showToast("success", t("activity.updateSuccess"));
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["activity", "detail", variables.id], context.previousData);
      }
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<void, Error, number>({
    mutationFn: activityApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["activity", "list"] });
      const previousData = queryClient.getQueryData<InfiniteData<PagedResponse<ActivityDto>>>(["activity", "list"]);
      if (previousData) {
        queryClient.setQueryData<InfiniteData<PagedResponse<ActivityDto>>>(
          ["activity", "list"],
          {
            ...previousData,
            pages: previousData.pages.map((page) => ({
              ...page,
              items: page.items.filter((activity) => activity.id !== id),
              totalCount: page.totalCount - 1,
            })),
          }
        );
      }
      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity", "list"] });
      showToast("success", t("activity.deleteSuccess"));
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["activity", "list"], context.previousData);
      }
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}
