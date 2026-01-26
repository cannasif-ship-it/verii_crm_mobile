import { useQuery } from "@tanstack/react-query";
import { stockApi } from "../api/stockApi";
import type { StockGetDto } from "../types";

export function useStock(id: number | undefined) {
  return useQuery<StockGetDto, Error>({
    queryKey: ["stock", "detail", id],
    queryFn: () => stockApi.getById(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
