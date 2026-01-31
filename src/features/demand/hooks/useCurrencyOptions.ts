import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { demandApi } from "../api";
import type { CurrencyOptionDto } from "../types";

interface UseCurrencyOptionsParams {
  tarih?: string;
  fiyatTipi?: number;
}

export function useCurrencyOptions(params?: UseCurrencyOptionsParams) {
  const stableParams = useMemo(() => {
    if (!params) return undefined;
    return {
      tarih: params.tarih || undefined,
      fiyatTipi: params.fiyatTipi || undefined,
    };
  }, [params?.tarih, params?.fiyatTipi]);

  return useQuery<CurrencyOptionDto[], Error>({
    queryKey: ["currency", "options", stableParams],
    queryFn: () => demandApi.getCurrencyOptions(stableParams),
    staleTime: 10 * 60 * 1000,
  });
}
