import { useInfiniteQuery } from "@tanstack/react-query";
import { orderApi } from "../api";
import type { PagedFilter, PagedResponse, OrderGetDto } from "../types";

const DEFAULT_PAGE_SIZE = 20;

interface UseOrderListParams {
  filters?: PagedFilter[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageSize?: number;
}

export function useOrderList(params: UseOrderListParams = {}) {
  const { filters, sortBy = "Id", sortDirection = "desc", pageSize = DEFAULT_PAGE_SIZE } = params;

  return useInfiniteQuery<PagedResponse<OrderGetDto>, Error>({
    queryKey: ["order", "orders", { filters, sortBy, sortDirection }],
    queryFn: ({ pageParam }) =>
      orderApi.getList({
        pageNumber: pageParam as number,
        pageSize,
        sortBy,
        sortDirection,
        filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined),
    staleTime: 2 * 60 * 1000,
  });
}
