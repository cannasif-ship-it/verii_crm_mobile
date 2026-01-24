import { useQuery } from "@tanstack/react-query";
import { dailyTasksApi } from "../api";
import type { ActivityDto } from "../../activity/types";
import type { DailyTaskFilter } from "../types";

export function useDailyTasks(filter: DailyTaskFilter) {
  return useQuery<ActivityDto[], Error>({
    queryKey: ["dailyTasks", filter.startDate, filter.endDate, filter.assignedUserId, filter.status],
    queryFn: () => dailyTasksApi.getList(filter),
    staleTime: 5 * 60 * 1000,
    enabled: !!filter.startDate && !!filter.endDate,
  });
}
