import { useInfiniteQuery } from "@tanstack/react-query";
import { stockApi } from "../api/stockApi";
import type { StockRelationDto, PagedParams, PagedFilter } from "../types";

interface UseStockRelationsParams {
  stockId: number | undefined;
  filters?: PagedFilter[];
}

export function useStockRelations({ stockId, filters }: UseStockRelationsParams) {
  return useInfiniteQuery({
    queryKey: ["stock", "relations", stockId, filters],
    queryFn: ({ pageParam = 1 }) => {
      if (!stockId) {
        throw new Error("Stock ID is required");
      }
      const params: PagedParams = {
        pageNumber: pageParam,
        pageSize: 20,
        filters,
      };
      return stockApi.getRelations(stockId, params);
    },
    enabled: !!stockId,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
  });
}
