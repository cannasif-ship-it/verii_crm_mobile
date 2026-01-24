import { apiClient } from "../../../lib/axios";
import type { ApiResponse } from "../../auth/types";
import type {
  CustomerDto,
  CreateCustomerDto,
  UpdateCustomerDto,
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

export const customerApi = {
  getList: async (params: PagedParams = {}): Promise<PagedResponse<CustomerDto>> => {
    const queryParams = buildQueryParams(params);
    const response = await apiClient.get<PagedApiResponse<CustomerDto>>("/api/Customer", {
      params: queryParams,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Müşteri listesi alınamadı"
      );
    }

    return response.data.data;
  },

  getById: async (id: number): Promise<CustomerDto> => {
    const response = await apiClient.get<ApiResponse<CustomerDto>>(`/api/Customer/${id}`);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Müşteri bulunamadı"
      );
    }

    return response.data.data;
  },

  create: async (data: CreateCustomerDto): Promise<CustomerDto> => {
    const response = await apiClient.post<ApiResponse<CustomerDto>>("/api/Customer", data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Müşteri oluşturulamadı"
      );
    }

    return response.data.data;
  },

  update: async (id: number, data: UpdateCustomerDto): Promise<CustomerDto> => {
    const response = await apiClient.put<ApiResponse<CustomerDto>>(`/api/Customer/${id}`, data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Müşteri güncellenemedi"
      );
    }

    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/Customer/${id}`);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Müşteri silinemedi"
      );
    }
  },
};
