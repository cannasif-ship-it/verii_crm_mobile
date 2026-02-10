import { useQuery } from "@tanstack/react-query";
import { activityTypeApi } from "../../activity";
import type { ActivityTypeDto, PagedParams, PagedResponse } from "../types";

export function useActivityTypeList(params: PagedParams = {}) {
  return useQuery<PagedResponse<ActivityTypeDto>, Error>({
    queryKey: ["activityType", "list", params],
    queryFn: () => activityTypeApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
}
