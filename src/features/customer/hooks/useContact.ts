import { useQuery } from "@tanstack/react-query";
import { contactApi } from "../api/contactApi";
import type { ContactDto } from "../types";

export function useContact(id: number | undefined) {
  return useQuery<ContactDto, Error>({
    queryKey: ["contact", "detail", id],
    queryFn: () => contactApi.getById(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
