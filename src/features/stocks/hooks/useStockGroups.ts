import { useQuery } from "@tanstack/react-query";
import { stockApi } from "../api/stockApi";
import type { StockGroupDto } from "../types";

export function useStockGroups() {
  return useQuery<StockGroupDto[], Error>({
    queryKey: ["stock", "groups"],
    queryFn: () => stockApi.getGroups(),
    staleTime: 5 * 60 * 1000,
  });
}
