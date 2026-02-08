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

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const normalizeContact = (raw: unknown): ContactDto | null => {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;
  const id = toNumber(item.id ?? item.Id);
  const customerId = toNumber(item.customerId ?? item.CustomerId);
  const titleId = toNumber(item.titleId ?? item.TitleId);

  if (id == null || customerId == null || titleId == null) return null;

  return {
    id,
    fullName: String(item.fullName ?? item.FullName ?? ""),
    email: (item.email ?? item.Email ?? undefined) as string | undefined,
    phone: (item.phone ?? item.Phone ?? undefined) as string | undefined,
    mobile: (item.mobile ?? item.Mobile ?? undefined) as string | undefined,
    notes: (item.notes ?? item.Notes ?? undefined) as string | undefined,
    customerId,
    customerName: (item.customerName ?? item.CustomerName ?? undefined) as string | undefined,
    titleId,
    titleName: (item.titleName ?? item.TitleName ?? undefined) as string | undefined,
    createdDate: String(item.createdDate ?? item.CreatedDate ?? ""),
    updatedDate: (item.updatedDate ?? item.UpdatedDate ?? undefined) as string | undefined,
    isDeleted: Boolean(item.isDeleted ?? item.IsDeleted ?? false),
    createdByFullUser: (item.createdByFullUser ?? item.CreatedByFullUser ?? undefined) as string | undefined,
    updatedByFullUser: (item.updatedByFullUser ?? item.UpdatedByFullUser ?? undefined) as string | undefined,
    deletedByFullUser: (item.deletedByFullUser ?? item.DeletedByFullUser ?? undefined) as string | undefined,
  };
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
      .map(normalizeContact)
      .filter((item): item is ContactDto => item != null);

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

  getById: async (id: number): Promise<ContactDto> => {
    const response = await apiClient.get<ApiResponse<ContactDto>>(`/api/Contact/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.message || response.data.exceptionMessage || "Kişi bulunamadı");
    }

    const normalized = normalizeContact(response.data.data);
    if (!normalized) {
      throw new Error("Kişi verisi çözümlenemedi");
    }

    return normalized;
  },

  create: async (data: CreateContactDto): Promise<ContactDto> => {
    const response = await apiClient.post<ApiResponse<ContactDto>>("/api/Contact", data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Kişi oluşturulamadı"
      );
    }

    const normalized = normalizeContact(response.data.data);
    if (!normalized) {
      throw new Error("Kişi verisi çözümlenemedi");
    }

    return normalized;
  },

  update: async (id: number, data: UpdateContactDto): Promise<ContactDto> => {
    const response = await apiClient.put<ApiResponse<ContactDto>>(`/api/Contact/${id}`, data);

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "Kişi güncellenemedi"
      );
    }

    const normalized = normalizeContact(response.data.data);
    if (!normalized) {
      throw new Error("Kişi verisi çözümlenemedi");
    }

    return normalized;
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

    const payload = response.data.data as unknown as {
      items?: unknown[];
      Items?: unknown[];
    } | null;

    const rawItems = payload && Array.isArray(payload.items)
      ? payload.items
      : payload && Array.isArray(payload.Items)
        ? payload.Items
        : [];

    return rawItems
      .map(normalizeContact)
      .filter((item): item is ContactDto => item != null);
  },
};
