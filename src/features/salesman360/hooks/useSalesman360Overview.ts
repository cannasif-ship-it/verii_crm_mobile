import { useQuery } from "@tanstack/react-query";
import { salesman360Api, SALESMEN_360_STALE_MS } from "../api";
import type { Salesmen360OverviewDto } from "../types";

export function useSalesman360Overview(
  userId: number | undefined,
  currency: string | null
): ReturnType<typeof useQuery<Salesmen360OverviewDto, Error>> {
  return useQuery<Salesmen360OverviewDto, Error>({
    queryKey: ["salesman360", "overview", userId, currency],
    queryFn: () => salesman360Api.getOverview(userId!, currency),
    enabled: typeof userId === "number" && userId > 0,
    staleTime: SALESMEN_360_STALE_MS,
  });
}
