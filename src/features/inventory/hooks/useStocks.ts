import { useInfiniteQuery } from "@tanstack/react-query";
import { stockApi } from "../api/stockApi";
import type { StockGetDto, PagedParams, PagedFilter } from "../types";

interface UseStocksParams {
  filters?: PagedFilter[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageSize?: number;
}

export function useStocks(params: UseStocksParams = {}) {
  const { filters, sortBy = "stockName", sortDirection = "asc", pageSize = 20 } = params;

  return useInfiniteQuery({
    queryKey: ["stock", "list", { filters, sortBy, sortDirection }],
    queryFn: ({ pageParam = 1 }) =>
      stockApi.getList({
        pageNumber: pageParam as number,
        pageSize,
        sortBy,
        sortDirection,
        filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined),
    staleTime: 30 * 1000,
  });
}
