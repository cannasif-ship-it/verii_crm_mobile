import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { shippingAddressApi } from "../api/shippingAddressApi";
import { useToastStore } from "../../../store/toast";
import type { CreateShippingAddressDto, UpdateShippingAddressDto, ShippingAddressDto, PagedResponse } from "../types";

export function useCreateShippingAddress() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<ShippingAddressDto, Error, CreateShippingAddressDto>({
    mutationFn: shippingAddressApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shippingAddress", "list"] });
      queryClient.invalidateQueries({ queryKey: ["shippingAddress", "byCustomer", data.customerId] });
      showToast("success", t("shippingAddress.createSuccess"));
    },
    onError: (error) => {
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}

export function useUpdateShippingAddress() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<ShippingAddressDto, Error, { id: number; data: UpdateShippingAddressDto }>({
    mutationFn: ({ id, data }) => shippingAddressApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["shippingAddress", "detail", id] });
      const previousData = queryClient.getQueryData<ShippingAddressDto>(["shippingAddress", "detail", id]);
      if (previousData) {
        queryClient.setQueryData<ShippingAddressDto>(["shippingAddress", "detail", id], {
          ...previousData,
          ...data,
        });
      }
      return { previousData };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shippingAddress", "list"] });
      queryClient.invalidateQueries({ queryKey: ["shippingAddress", "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["shippingAddress", "byCustomer", data.customerId] });
      showToast("success", t("shippingAddress.updateSuccess"));
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["shippingAddress", "detail", variables.id], context.previousData);
      }
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}

export function useDeleteShippingAddress() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<void, Error, number>({
    mutationFn: shippingAddressApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["shippingAddress", "list"] });
      const previousData = queryClient.getQueryData<InfiniteData<PagedResponse<ShippingAddressDto>>>(["shippingAddress", "list"]);
      if (previousData) {
        queryClient.setQueryData<InfiniteData<PagedResponse<ShippingAddressDto>>>(
          ["shippingAddress", "list"],
          {
            ...previousData,
            pages: previousData.pages.map((page) => ({
              ...page,
              items: page.items.filter((address) => address.id !== id),
              totalCount: page.totalCount - 1,
            })),
          }
        );
      }
      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingAddress", "list"] });
      queryClient.invalidateQueries({ queryKey: ["shippingAddress", "byCustomer"] });
      showToast("success", t("shippingAddress.deleteSuccess"));
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["shippingAddress", "list"], context.previousData);
      }
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}
