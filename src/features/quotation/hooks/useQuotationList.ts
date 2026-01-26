import { useInfiniteQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { PagedFilter, PagedResponse, QuotationGetDto } from "../types";

const DEFAULT_PAGE_SIZE = 20;

interface UseQuotationListParams {
  filters?: PagedFilter[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageSize?: number;
}

export function useQuotationList(params: UseQuotationListParams = {}) {
  const { filters, sortBy = "Id", sortDirection = "desc", pageSize = DEFAULT_PAGE_SIZE } = params;

  return useInfiniteQuery<PagedResponse<QuotationGetDto>, Error>({
    queryKey: ["quotation", "quotations", { filters, sortBy, sortDirection }],
    queryFn: ({ pageParam }) =>
      quotationApi.getList({
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
