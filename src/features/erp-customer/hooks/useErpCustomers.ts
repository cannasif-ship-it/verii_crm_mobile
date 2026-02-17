import { useQuery } from "@tanstack/react-query";
import { erpCustomerApi } from "../api/erpCustomerApi";
import type { CariDto } from "../types";

export function useErpCustomers() {
  return useQuery<CariDto[], Error>({
    queryKey: ["erpCustomers", "fullList"],
    queryFn: () => erpCustomerApi.getCaris(),
    staleTime: 1000 * 60 * 10, // 10 dakika boyunca veriyi taze say, tekrar çekme
  });
}