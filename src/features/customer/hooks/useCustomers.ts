import { useInfiniteQuery } from "@tanstack/react-query";
import { customerApi } from "../api/customerApi";
import type { PagedFilter, PagedResponse, CustomerDto } from "../types";

const DEFAULT_PAGE_SIZE = 20;

interface UseCustomersParams {
  filters?: PagedFilter[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageSize?: number;
}

export function useCustomers(params: UseCustomersParams = {}) {
  const { filters, sortBy = "name", sortDirection = "asc", pageSize = DEFAULT_PAGE_SIZE } = params;

  return useInfiniteQuery<PagedResponse<CustomerDto>, Error>({
    queryKey: ["customer", "list", { filters, sortBy, sortDirection }],
    queryFn: ({ pageParam }) =>
      customerApi.getList({
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
