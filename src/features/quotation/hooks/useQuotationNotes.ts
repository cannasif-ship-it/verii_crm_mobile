import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { QuotationNotesGetDto } from "../types";

const STALE_TIME_MS = 2 * 60 * 1000;

export function useQuotationNotes(quotationId: number | undefined) {
  return useQuery<QuotationNotesGetDto | null, Error>({
    queryKey: ["quotation", "notes", quotationId],
    queryFn: () => quotationApi.getQuotationNotes(quotationId!),
    enabled: typeof quotationId === "number" && quotationId > 0,
    staleTime: STALE_TIME_MS,
  });
}
