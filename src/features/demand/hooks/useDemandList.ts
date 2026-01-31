import { useInfiniteQuery } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { PagedFilter, PagedResponse, DemandGetDto } from "../types";

const DEFAULT_PAGE_SIZE = 20;

interface UseDemandListParams {
  filters?: PagedFilter[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageSize?: number;
}

export function useDemandList(params: UseDemandListParams = {}) {
  const { filters, sortBy = "Id", sortDirection = "desc", pageSize = DEFAULT_PAGE_SIZE } = params;

  return useInfiniteQuery<PagedResponse<DemandGetDto>, Error>({
    queryKey: ["demand", "demands", { filters, sortBy, sortDirection }],
    queryFn: ({ pageParam }) =>
      demandApi.getList({
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
