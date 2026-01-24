import { apiClient } from "../../../lib/axios";
import type { ApiResponse } from "../../auth/types";
import type {
  ContactDto,
  CreateContactDto,
  UpdateContactDto,
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

export const contactApi = {
  getList: async (params: PagedParams = {}): Promise<PagedResponse<ContactDto>> => {
    const queryParams = buildQueryParams(params);
    const response = await apiClient.get<PagedApiResponse<ContactDto>>("/api/Contact", {
      params: queryParams,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Kişi listesi alınamadı"
      );
    }

    return response.data.data;
  },

  getById: async (id: number): Promise<ContactDto> => {
    const response = await apiClient.get<ApiResponse<ContactDto>>(`/api/Contact/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || response.data.exceptionMessage || "Kişi bulunamadı");
    }

    return response.data.data;
  },

  create: async (data: CreateContactDto): Promise<ContactDto> => {
    const response = await apiClient.post<ApiResponse<ContactDto>>("/api/Contact", data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Kişi oluşturulamadı"
      );
    }

    return response.data.data;
  },

  update: async (id: number, data: UpdateContactDto): Promise<ContactDto> => {
    const response = await apiClient.put<ApiResponse<ContactDto>>(`/api/Contact/${id}`, data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Kişi güncellenemedi"
      );
    }

    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/Contact/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || response.data.exceptionMessage || "Kişi silinemedi");
    }
  },

  getByCustomerId: async (customerId: number): Promise<ContactDto[]> => {
    const queryParams = buildQueryParams({
      filters: [{ column: "customerId", operator: "equals", value: String(customerId) }],
      pageSize: 100,
    });
    const response = await apiClient.get<PagedApiResponse<ContactDto>>("/api/Contact", {
      params: queryParams,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Kişi listesi alınamadı"
      );
    }

    return response.data.data.items;
  },
};
