import { useQuery } from "@tanstack/react-query";
import { activityApi } from "../api";
import type { ActivityDto } from "../types";

export function useActivity(id: number | undefined) {
  return useQuery<ActivityDto, Error>({
    queryKey: ["activity", "detail", id],
    queryFn: () => activityApi.getById(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
