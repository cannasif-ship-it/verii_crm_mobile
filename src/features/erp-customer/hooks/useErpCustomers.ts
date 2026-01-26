import { useQuery } from "@tanstack/react-query";
import { erpCustomerApi } from "../api";
import type { CariDto } from "../types";

export function useErpCustomers(cariKodu?: string | null) {
  return useQuery<CariDto[]>({
    queryKey: ["erpCustomers", cariKodu || "all"],
    queryFn: () => erpCustomerApi.getCaris(cariKodu),
    staleTime: 5 * 60 * 1000,
  });
}
