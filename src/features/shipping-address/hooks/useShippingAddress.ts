import { useQuery } from "@tanstack/react-query";
import { shippingAddressApi } from "../api/shippingAddressApi";
import type { ShippingAddressDto } from "../types";

export function useShippingAddress(id: number | undefined) {
  return useQuery<ShippingAddressDto, Error>({
    queryKey: ["shippingAddress", "detail", id],
    queryFn: () => shippingAddressApi.getById(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
