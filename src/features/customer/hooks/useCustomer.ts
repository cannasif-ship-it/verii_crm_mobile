import { useQuery } from "@tanstack/react-query";
import { customerApi } from "../api/customerApi";
import type { CustomerDto } from "../types";

export function useCustomer(id: number | undefined) {
  return useQuery<CustomerDto, Error>({
    queryKey: ["customer", "detail", id],
    queryFn: () => customerApi.getById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}
