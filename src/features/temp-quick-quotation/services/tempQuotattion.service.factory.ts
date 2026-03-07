import type { ApiResponse } from "../../auth/types";
import type {
  TempQuickQuotationPagedParams,
  TempQuotattionCreateDto,
  TempQuotattionDeleteResponse,
  TempQuotattionExchangeLineCreateDto,
  TempQuotattionExchangeLineDeleteResponse,
  TempQuotattionExchangeLineGetDto,
  TempQuotattionExchangeLineListResponse,
  TempQuotattionExchangeLineResponse,
  TempQuotattionExchangeLineUpdateDto,
  TempQuotattionGetDto,
  TempQuotattionLineCreateDto,
  TempQuotattionLineDeleteResponse,
  TempQuotattionLineGetDto,
  TempQuotattionLineListResponse,
  TempQuotattionLineResponse,
  TempQuotattionLineUpdateDto,
  TempQuotattionListResponse,
  TempQuotattionResponse,
  TempQuotattionUpdateDto,
} from "../models/tempQuotattion.model";
import type { PagedResponse } from "../../customer/types/common";

export interface TempQuickQuotationHttpClient {
  get<T>(url: string, config?: { params?: Record<string, string | number> }): Promise<{ data: T }>;
  post<T>(url: string, data?: unknown): Promise<{ data: T }>;
  put<T>(url: string, data?: unknown): Promise<{ data: T }>;
  delete<T>(url: string): Promise<{ data: T }>;
}

const TEMP_QUOTATTION_ENDPOINT = "/api/TempQuotattion";

function buildQueryParams(params: TempQuickQuotationPagedParams): Record<string, string | number> {
  const queryParams: Record<string, string | number> = {};

  if (params.pageNumber) queryParams.pageNumber = params.pageNumber;
  if (params.pageSize) queryParams.pageSize = params.pageSize;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortDirection) queryParams.sortDirection = params.sortDirection;
  if (params.filters && params.filters.length > 0) {
    queryParams.filters = JSON.stringify(params.filters);
  }

  return queryParams;
}

function unwrap<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.success) {
    throw new Error(response.message || response.exceptionMessage || fallbackMessage);
  }

  return response.data;
}

function ensureData<T>(data: T | null | undefined, fallbackMessage: string): T {
  if (data === null || data === undefined) {
    throw new Error(fallbackMessage);
  }

  return data;
}

export function createTempQuotattionService(httpClient: TempQuickQuotationHttpClient) {
  return {
    async getList(params: TempQuickQuotationPagedParams = {}): Promise<PagedResponse<TempQuotattionGetDto>> {
      const response = await httpClient.get<TempQuotattionListResponse>(TEMP_QUOTATTION_ENDPOINT, {
        params: buildQueryParams(params),
      });

      const data = unwrap(response.data, "Hızlı teklif listesi alınamadı");
      return ensureData(data, "Hızlı teklif listesi alınamadı");
    },

    async getById(id: number): Promise<TempQuotattionGetDto> {
      const response = await httpClient.get<TempQuotattionResponse>(`${TEMP_QUOTATTION_ENDPOINT}/${id}`);
      return ensureData(unwrap(response.data, "Hızlı teklif detayı alınamadı"), "Hızlı teklif detayı alınamadı");
    },

    async create(payload: TempQuotattionCreateDto): Promise<TempQuotattionGetDto> {
      const response = await httpClient.post<TempQuotattionResponse>(TEMP_QUOTATTION_ENDPOINT, payload);
      return ensureData(unwrap(response.data, "Hızlı teklif oluşturulamadı"), "Hızlı teklif oluşturulamadı");
    },

    async update(id: number, payload: TempQuotattionUpdateDto): Promise<TempQuotattionGetDto> {
      const response = await httpClient.put<TempQuotattionResponse>(`${TEMP_QUOTATTION_ENDPOINT}/${id}`, payload);
      return ensureData(unwrap(response.data, "Hızlı teklif güncellenemedi"), "Hızlı teklif güncellenemedi");
    },

    async setApproved(id: number): Promise<TempQuotattionGetDto> {
      const response = await httpClient.post<TempQuotattionResponse>(`${TEMP_QUOTATTION_ENDPOINT}/${id}/set-approved`);
      return ensureData(unwrap(response.data, "Hızlı teklif onaylanamadı"), "Hızlı teklif onaylanamadı");
    },

    async remove(id: number): Promise<void> {
      const response = await httpClient.delete<TempQuotattionDeleteResponse>(`${TEMP_QUOTATTION_ENDPOINT}/${id}`);
      unwrap(response.data, "Hızlı teklif silinemedi");
    },

    async getLinesByHeaderId(tempQuotattionId: number): Promise<TempQuotattionLineGetDto[]> {
      const response = await httpClient.get<TempQuotattionLineListResponse>(
        `${TEMP_QUOTATTION_ENDPOINT}/${tempQuotattionId}/lines`
      );
      return unwrap(response.data, "Hızlı teklif satırları alınamadı") ?? [];
    },

    async getLineById(lineId: number): Promise<TempQuotattionLineGetDto> {
      const response = await httpClient.get<TempQuotattionLineResponse>(`${TEMP_QUOTATTION_ENDPOINT}/lines/${lineId}`);
      return ensureData(unwrap(response.data, "Hızlı teklif satırı alınamadı"), "Hızlı teklif satırı alınamadı");
    },

    async createLine(payload: TempQuotattionLineCreateDto): Promise<TempQuotattionLineGetDto> {
      const response = await httpClient.post<TempQuotattionLineResponse>(`${TEMP_QUOTATTION_ENDPOINT}/lines`, payload);
      return ensureData(unwrap(response.data, "Hızlı teklif satırı oluşturulamadı"), "Hızlı teklif satırı oluşturulamadı");
    },

    async createLines(payload: TempQuotattionLineCreateDto[]): Promise<TempQuotattionLineGetDto[]> {
      const response = await httpClient.post<TempQuotattionLineListResponse>(`${TEMP_QUOTATTION_ENDPOINT}/lines/bulk`, payload);
      return unwrap(response.data, "Hızlı teklif satırları oluşturulamadı") ?? [];
    },

    async updateLine(lineId: number, payload: TempQuotattionLineUpdateDto): Promise<TempQuotattionLineGetDto> {
      const response = await httpClient.put<TempQuotattionLineResponse>(`${TEMP_QUOTATTION_ENDPOINT}/lines/${lineId}`, payload);
      return ensureData(unwrap(response.data, "Hızlı teklif satırı güncellenemedi"), "Hızlı teklif satırı güncellenemedi");
    },

    async removeLine(lineId: number): Promise<void> {
      const response = await httpClient.delete<TempQuotattionLineDeleteResponse>(`${TEMP_QUOTATTION_ENDPOINT}/lines/${lineId}`);
      unwrap(response.data, "Hızlı teklif satırı silinemedi");
    },

    async getExchangeLinesByHeaderId(tempQuotattionId: number): Promise<TempQuotattionExchangeLineGetDto[]> {
      const response = await httpClient.get<TempQuotattionExchangeLineListResponse>(
        `${TEMP_QUOTATTION_ENDPOINT}/${tempQuotattionId}/exchange-lines`
      );
      return unwrap(response.data, "Hızlı teklif kur satırları alınamadı") ?? [];
    },

    async getExchangeLineById(exchangeLineId: number): Promise<TempQuotattionExchangeLineGetDto> {
      const response = await httpClient.get<TempQuotattionExchangeLineResponse>(
        `${TEMP_QUOTATTION_ENDPOINT}/exchange-lines/${exchangeLineId}`
      );
      return ensureData(unwrap(response.data, "Hızlı teklif kur satırı alınamadı"), "Hızlı teklif kur satırı alınamadı");
    },

    async createExchangeLine(payload: TempQuotattionExchangeLineCreateDto): Promise<TempQuotattionExchangeLineGetDto> {
      const response = await httpClient.post<TempQuotattionExchangeLineResponse>(
        `${TEMP_QUOTATTION_ENDPOINT}/exchange-lines`,
        payload
      );
      return ensureData(unwrap(response.data, "Hızlı teklif kur satırı oluşturulamadı"), "Hızlı teklif kur satırı oluşturulamadı");
    },

    async updateExchangeLine(
      exchangeLineId: number,
      payload: TempQuotattionExchangeLineUpdateDto
    ): Promise<TempQuotattionExchangeLineGetDto> {
      const response = await httpClient.put<TempQuotattionExchangeLineResponse>(
        `${TEMP_QUOTATTION_ENDPOINT}/exchange-lines/${exchangeLineId}`,
        payload
      );
      return ensureData(unwrap(response.data, "Hızlı teklif kur satırı güncellenemedi"), "Hızlı teklif kur satırı güncellenemedi");
    },

    async removeExchangeLine(exchangeLineId: number): Promise<void> {
      const response = await httpClient.delete<TempQuotattionExchangeLineDeleteResponse>(
        `${TEMP_QUOTATTION_ENDPOINT}/exchange-lines/${exchangeLineId}`
      );
      unwrap(response.data, "Hızlı teklif kur satırı silinemedi");
    },
  };
}

export type TempQuotattionService = ReturnType<typeof createTempQuotattionService>;
