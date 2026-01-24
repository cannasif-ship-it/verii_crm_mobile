import { apiClient } from "../../../lib/axios";
import type { ApiResponse } from "../../auth/types";
import type { ActivityDto, PagedResponse, PagedApiResponse } from "../../activity/types";
import type { DailyTaskFilter } from "../types";

interface PagedFilter {
  column: string;
  operator: string;
  value: string;
}

const buildFilters = (filter: DailyTaskFilter): PagedFilter[] => {
  const filters: PagedFilter[] = [];

  if (filter.startDate) {
    filters.push({
      column: "activityDate",
      operator: "gte",
      value: filter.startDate,
    });
  }

  if (filter.endDate) {
    filters.push({
      column: "activityDate",
      operator: "lte",
      value: filter.endDate,
    });
  }

  if (filter.assignedUserId) {
    filters.push({
      column: "assignedUserId",
      operator: "equals",
      value: String(filter.assignedUserId),
    });
  }

  if (filter.status) {
    filters.push({
      column: "status",
      operator: "equals",
      value: filter.status,
    });
  }

  return filters;
};

export const dailyTasksApi = {
  getList: async (filter: DailyTaskFilter): Promise<ActivityDto[]> => {
    const filters = buildFilters(filter);

    const response = await apiClient.get<PagedApiResponse<ActivityDto>>("/api/Activity", {
      params: {
        pageNumber: 1,
        pageSize: 100,
        sortBy: "activityDate",
        sortDirection: "asc",
        filters: filters.length > 0 ? JSON.stringify(filters) : undefined,
      },
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Görevler alınamadı"
      );
    }

    return response.data.data.items;
  },

  updateStatus: async (
    id: number,
    status: string,
    isCompleted: boolean
  ): Promise<ActivityDto> => {
    const response = await apiClient.put<ApiResponse<ActivityDto>>(`/api/Activity/${id}`, {
      status,
      isCompleted,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Görev güncellenemedi"
      );
    }

    return response.data.data;
  },
};
