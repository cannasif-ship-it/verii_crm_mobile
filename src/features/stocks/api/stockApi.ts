import { apiClient } from "../../../lib/axios";
import type { ApiResponse } from "../../auth/types";
import type {
  StockGetDto,
  StockRelationDto,
  StockRelationCreateDto,
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

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const normalizeStock = (raw: unknown): StockGetDto | null => {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;
  const id = toNumber(item.id ?? item.Id);
  if (id == null) return null;

  const erpStockCode = String(item.erpStockCode ?? item.ErpStockCode ?? "");
  const stockName = String(item.stockName ?? item.StockName ?? erpStockCode ?? "").trim();
  const branchCode = toNumber(item.branchCode ?? item.BranchCode) ?? 0;

  return {
    id,
    erpStockCode,
    stockName,
    unit: (item.unit ?? item.Unit ?? undefined) as string | undefined,
    ureticiKodu: (item.ureticiKodu ?? item.UreticiKodu ?? undefined) as string | undefined,
    branchCode,
    stockImages: (item.stockImages ?? item.StockImages ?? []) as StockGetDto["stockImages"],
    parentRelations: (item.parentRelations ?? item.ParentRelations ?? []) as StockGetDto["parentRelations"],
    grupKodu: (item.grupKodu ?? item.GrupKodu ?? undefined) as string | undefined,
    grupAdi: (item.grupAdi ?? item.GrupAdi ?? undefined) as string | undefined,
    kod1: (item.kod1 ?? item.Kod1 ?? undefined) as string | undefined,
    kod1Adi: (item.kod1Adi ?? item.Kod1Adi ?? undefined) as string | undefined,
    kod2: (item.kod2 ?? item.Kod2 ?? undefined) as string | undefined,
    kod2Adi: (item.kod2Adi ?? item.Kod2Adi ?? undefined) as string | undefined,
    kod3: (item.kod3 ?? item.Kod3 ?? undefined) as string | undefined,
    kod3Adi: (item.kod3Adi ?? item.Kod3Adi ?? undefined) as string | undefined,
    kod4: (item.kod4 ?? item.Kod4 ?? undefined) as string | undefined,
    kod4Adi: (item.kod4Adi ?? item.Kod4Adi ?? undefined) as string | undefined,
    kod5: (item.kod5 ?? item.Kod5 ?? undefined) as string | undefined,
    kod5Adi: (item.kod5Adi ?? item.Kod5Adi ?? undefined) as string | undefined,
    stockDetail: (item.stockDetail ?? item.StockDetail ?? undefined) as StockGetDto["stockDetail"],
    createdDate: (item.createdDate ?? item.CreatedDate ?? undefined) as string | undefined,
    updatedDate: (item.updatedDate ?? item.UpdatedDate ?? undefined) as string | undefined,
    deletedDate: (item.deletedDate ?? item.DeletedDate ?? undefined) as string | undefined,
    isDeleted: (item.isDeleted ?? item.IsDeleted ?? false) as boolean,
    createdByFullUser: (item.createdByFullUser ?? item.CreatedByFullUser ?? undefined) as string | undefined,
    updatedByFullUser: (item.updatedByFullUser ?? item.UpdatedByFullUser ?? undefined) as string | undefined,
    deletedByFullUser: (item.deletedByFullUser ?? item.DeletedByFullUser ?? undefined) as string | undefined,
  };
};

export const stockApi = {
  getList: async (params: PagedParams = {}): Promise<PagedResponse<StockGetDto>> => {
    const queryParams = buildQueryParams(params);
    const response = await apiClient.get<PagedApiResponse<StockGetDto>>("/api/Stock", {
      params: queryParams,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Stok listesi alınamadı"
      );
    }

    const payload = response.data.data as unknown;
    if (!payload || typeof payload !== "object") {
      return {
        items: [],
        totalCount: 0,
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 20,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }

    const shaped = payload as {
      items?: unknown[];
      Items?: unknown[];
      totalCount?: number;
      TotalCount?: number;
      pageNumber?: number;
      PageNumber?: number;
      pageSize?: number;
      PageSize?: number;
      totalPages?: number;
      TotalPages?: number;
      hasPreviousPage?: boolean;
      HasPreviousPage?: boolean;
      hasNextPage?: boolean;
      HasNextPage?: boolean;
    };

    const rawItems = Array.isArray(shaped.items)
      ? shaped.items
      : Array.isArray(shaped.Items)
        ? shaped.Items
        : [];

    const items = rawItems
      .map(normalizeStock)
      .filter((item): item is StockGetDto => item != null);

    return {
      items,
      totalCount: shaped.totalCount ?? shaped.TotalCount ?? items.length,
      pageNumber: shaped.pageNumber ?? shaped.PageNumber ?? (params.pageNumber ?? 1),
      pageSize: shaped.pageSize ?? shaped.PageSize ?? (params.pageSize ?? 20),
      totalPages: shaped.totalPages ?? shaped.TotalPages ?? 1,
      hasPreviousPage: shaped.hasPreviousPage ?? shaped.HasPreviousPage ?? false,
      hasNextPage: shaped.hasNextPage ?? shaped.HasNextPage ?? false,
    };
  },

  getById: async (id: number): Promise<StockGetDto> => {
    const response = await apiClient.get<ApiResponse<StockGetDto>>(`/api/Stock/${id}`);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Stok bulunamadı"
      );
    }

    const normalized = normalizeStock(response.data.data);
    if (!normalized) {
      throw new Error("Stok verisi çözümlenemedi");
    }

    return normalized;
  },

  getRelations: async (stockId: number, params: PagedParams = {}): Promise<PagedResponse<StockRelationDto>> => {
    const queryParams = buildQueryParams(params);
    const response = await apiClient.get<PagedApiResponse<StockRelationDto>>(
      `/api/Stock/${stockId}/relations`,
      {
        params: queryParams,
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Stok ilişkileri alınamadı"
      );
    }

    return response.data.data;
  },

  getRelationsAsRelatedStock: async (
    relatedStockId: number,
    params: PagedParams = {}
  ): Promise<PagedResponse<StockRelationDto>> => {
    const queryParams = { ...buildQueryParams(params), asRelated: "true" };
    const response = await apiClient.get<PagedApiResponse<StockRelationDto>>(
      `/api/Stock/${relatedStockId}/relations`,
      { params: queryParams }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Stok ilişkileri alınamadı"
      );
    }

    const raw = response.data.data;
    const items = Array.isArray(raw)
      ? raw
      : (raw && Array.isArray((raw as PagedResponse<StockRelationDto>).items)
          ? (raw as PagedResponse<StockRelationDto>).items
          : []);

    return {
      items,
      totalCount: items.length,
      pageNumber: 1,
      pageSize: params.pageSize ?? 100,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },

  createRelation: async (data: StockRelationCreateDto): Promise<StockRelationDto> => {
    const response = await apiClient.post<ApiResponse<StockRelationDto>>(
      `/api/Stock/${data.stockId}/relations`,
      data
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Stok ilişkisi oluşturulamadı"
      );
    }

    return response.data.data;
  },

  deleteRelation: async (stockId: number, relationId: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/Stock/${stockId}/relations/${relationId}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Stok ilişkisi silinemedi"
      );
    }
  },
};
