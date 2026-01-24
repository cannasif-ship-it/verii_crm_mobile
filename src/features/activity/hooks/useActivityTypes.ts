import { useQuery } from "@tanstack/react-query";
import { activityTypeApi } from "../api";
import type { ActivityTypeDto } from "../types";

export function useActivityTypes() {
  return useQuery<ActivityTypeDto[], Error>({
    queryKey: ["activityType", "list"],
    queryFn: activityTypeApi.getList,
    staleTime: 5 * 60 * 1000,
  });
}
