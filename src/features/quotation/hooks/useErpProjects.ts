import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "../api";
import type { ProjeDto } from "../types";

export function useErpProjects() {
  return useQuery<ProjeDto[]>({
    queryKey: ["quotation", "erpProjects"],
    queryFn: () => quotationApi.getProjectCodes(),
    staleTime: 10 * 60 * 1000,
  });
}
