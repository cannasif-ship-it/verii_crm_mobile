import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { ExchangeRateDto } from "../types";

interface UseExchangeRateParams {
  tarih?: string;
  fiyatTipi?: number;
}

export function useExchangeRate(params?: UseExchangeRateParams) {
  const stableParams = useMemo(() => {
    if (!params) return undefined;
    return {
      tarih: params.tarih || undefined,
      fiyatTipi: params.fiyatTipi || undefined,
    };
  }, [params?.tarih, params?.fiyatTipi]);

  return useQuery<ExchangeRateDto[], Error>({
    queryKey: ["exchangeRate", stableParams],
    queryFn: () => quotationApi.getExchangeRate(stableParams),
    staleTime: 5 * 60 * 1000,
  });
}
