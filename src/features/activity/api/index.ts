import { apiClient } from "../../../lib/axios";
import type { ApiResponse } from "../../auth/types";
import type {
  ActivityDto,
  ActivityTypeDto,
  CreateActivityDto,
  UpdateActivityDto,
  PagedParams,
  PagedResponse,
  PagedApiResponse,
} from "../types";

const buildQueryParams = (params: PagedParams): Record<string, string | number> => {
  const queryParams: Record<string, string | number> = {};

  if (params.pageNumber) {
    queryParams.pageNumber = params.pageNumber;
  }
  if (params.pageSize) {
    queryParams.pageSize = params.pageSize;
  }
  if (params.sortBy) {
    queryParams.sortBy = params.sortBy;
  }
  if (params.sortDirection) {
    queryParams.sortDirection = params.sortDirection;
  }
  if (params.filters && params.filters.length > 0) {
    queryParams.filters = JSON.stringify(params.filters);
  }

  return queryParams;
};

export const activityApi = {
  getList: async (params: PagedParams = {}): Promise<PagedResponse<ActivityDto>> => {
    const queryParams = buildQueryParams(params);
    const response = await apiClient.get<PagedApiResponse<ActivityDto>>("/api/Activity", {
      params: queryParams,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Aktivite listesi alınamadı"
      );
    }

    return response.data.data;
  },

  getById: async (id: number): Promise<ActivityDto> => {
    const response = await apiClient.get<ApiResponse<ActivityDto>>(`/api/Activity/${id}`);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Aktivite bulunamadı"
      );
    }

    return response.data.data;
  },

  create: async (data: CreateActivityDto): Promise<ActivityDto> => {
    const response = await apiClient.post<ApiResponse<ActivityDto>>("/api/Activity", data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Aktivite oluşturulamadı"
      );
    }

    return response.data.data;
  },

  update: async (id: number, data: UpdateActivityDto): Promise<ActivityDto> => {
    const response = await apiClient.put<ApiResponse<ActivityDto>>(`/api/Activity/${id}`, data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Aktivite güncellenemedi"
      );
    }

    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/Activity/${id}`);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Aktivite silinemedi"
      );
    }
  },
};

export const activityTypeApi = {
  getList: async (): Promise<ActivityTypeDto[]> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<ActivityTypeDto>>>("/api/ActivityType", {
      params: { pageSize: 100 },
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Aktivite tipleri alınamadı"
      );
    }

    return response.data.data.items;
  },
};
