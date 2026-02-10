import { useQuery } from "@tanstack/react-query";
import { activityTypeApi } from "../../activity";
import type { ActivityTypeDto } from "../types";

export function useActivityType(id: number | undefined) {
  return useQuery<ActivityTypeDto, Error>({
    queryKey: ["activityType", "detail", id],
    queryFn: () => activityTypeApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
