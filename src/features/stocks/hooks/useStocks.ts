import { useInfiniteQuery } from "@tanstack/react-query";
import { stockApi } from "../api/stockApi";
import type { StockGetDto, PagedFilter, PagedResponse } from "../types";

interface UseStocksParams {
  filters?: PagedFilter[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageSize?: number;
}

// Hook artık hem parametreleri hem de arama metnini alıyor
export function useStocks(params: UseStocksParams = {}, searchQuery?: string) {
  const { 
    filters = [], 
    sortBy = "stockName", 
    sortDirection = "asc", 
    pageSize = 20 
  } = params;

  // Generic Tip Tanımlaması: <BackenddenDönenVeriTipi, HataTipi>
  return useInfiniteQuery<PagedResponse<StockGetDto>, Error>({
    
    // Arama metni değiştiğinde liste sıfırlansın diye queryKey'e ekledik
    queryKey: ["stock", "list", { filters, sortBy, sortDirection, pageSize, searchQuery }],
    
    queryFn: ({ pageParam = 1 }) => {
      // Filtre dizisini kopyalıyoruz (State mutation olmasın diye)
      const activeFilters: PagedFilter[] = [...filters];

      // Eğer arama metni varsa (en az 2 karakter), Backend'in beklediği filtreyi ekle
      if (searchQuery && searchQuery.trim().length >= 2) {
        activeFilters.push({
          // DİKKAT: Senin types.ts dosyan 'column' bekliyor!
          column: "StockName", // Backend'deki veritabanı sütun/property adı
          operator: "contains",
          value: searchQuery.trim(),
        });
      }

      return stockApi.getList({
        pageNumber: pageParam as number,
        pageSize,
        sortBy,
        sortDirection,
        filters: activeFilters,
      });
    },
    
    initialPageParam: 1,
    
    // Tip güvenliği sayesinde 'lastPage' artık PagedResponse tipinde.
    // .hasNextPage ve .pageNumber özellikleri otomatik geliyor.
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
    },
    
    staleTime: 30 * 1000,
  });
}