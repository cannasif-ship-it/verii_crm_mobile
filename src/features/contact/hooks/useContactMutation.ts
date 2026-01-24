import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { contactApi } from "../api/contactApi";
import { useToastStore } from "../../../store/toast";
import type { CreateContactDto, UpdateContactDto, ContactDto, PagedResponse } from "../types";

export function useCreateContact() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<ContactDto, Error, CreateContactDto>({
    mutationFn: contactApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contact", "list"] });
      queryClient.invalidateQueries({ queryKey: ["contact", "byCustomer", data.customerId] });
      showToast("success", t("contact.createSuccess"));
    },
    onError: (error) => {
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<
    ContactDto,
    Error,
    { id: number; data: UpdateContactDto },
    { previousData: ContactDto | undefined }
  >({
    mutationFn: ({ id, data }) => contactApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["contact", "detail", id] });
      const previousData = queryClient.getQueryData<ContactDto>(["contact", "detail", id]);
      if (previousData) {
        queryClient.setQueryData<ContactDto>(["contact", "detail", id], {
          ...previousData,
          ...data,
        });
      }
      return { previousData };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contact", "list"] });
      queryClient.invalidateQueries({ queryKey: ["contact", "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["contact", "byCustomer", data.customerId] });
      showToast("success", t("contact.updateSuccess"));
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["contact", "detail", variables.id], context.previousData);
      }
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<
    void,
    Error,
    number,
    { previousData: InfiniteData<PagedResponse<ContactDto>> | undefined }
  >({
    mutationFn: contactApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["contact", "list"] });
      const previousData = queryClient.getQueryData<InfiniteData<PagedResponse<ContactDto>>>(["contact", "list"]);
      if (previousData) {
        queryClient.setQueryData<InfiniteData<PagedResponse<ContactDto>>>(
          ["contact", "list"],
          {
            ...previousData,
            pages: previousData.pages.map((page) => ({
              ...page,
              items: page.items.filter((contact) => contact.id !== id),
              totalCount: page.totalCount - 1,
            })),
          }
        );
      }
      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", "list"] });
      queryClient.invalidateQueries({ queryKey: ["contact", "byCustomer"] });
      showToast("success", t("contact.deleteSuccess"));
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["contact", "list"], context.previousData);
      }
      showToast("error", error.message || t("common.unknownError"));
    },
  });
}
