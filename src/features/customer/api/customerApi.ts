import { apiClient } from "../../../lib/axios";
import * as FileSystem from "expo-file-system";
import type { ApiResponse } from "../../auth/types";
import type {
  CustomerGetDto,
  CustomerDto,
  CustomerImageDto,
  CreateCustomerDto,
  CreateCustomerFromMobileDto,
  CreateCustomerFromMobileResultDto,
  UpdateCustomerDto,
  PagedParams,
  PagedResponse,
  PagedApiResponse,
} from "../types";

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

function getSafeUploadMeta(imageUri: string): { name: string; type: string; uri: string } {
  const cleanedUri = imageUri.split("?")[0]?.split("#")[0] ?? imageUri;
  let decodedUri = cleanedUri;
  try {
    decodedUri = decodeURIComponent(cleanedUri);
  } catch {
    decodedUri = cleanedUri;
  }
  const rawTail = decodedUri.split("/").pop()?.trim() || "";

  const fallbackBase = `customer_${Date.now()}`;
  const hasDot = rawTail.includes(".");
  const baseName = hasDot ? rawTail.substring(0, rawTail.lastIndexOf(".")) : rawTail || fallbackBase;
  const rawExt = hasDot ? rawTail.substring(rawTail.lastIndexOf(".") + 1).toLowerCase() : "";
  const safeExt = EXTENSION_TO_MIME[rawExt] ? rawExt : "jpg";
  const safeName = `${baseName.replace(/[^a-zA-Z0-9_-]/g, "_")}.${safeExt}`;

  return {
    uri: imageUri,
    name: safeName,
    type: EXTENSION_TO_MIME[safeExt] ?? "image/jpeg",
  };
}

async function ensureReadableUploadUri(imageUri: string): Promise<string> {
  if (!imageUri) return imageUri;
  if (imageUri.startsWith("file://")) return imageUri;

  if (imageUri.startsWith("content://")) {
    const cacheBase = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!cacheBase) return imageUri;

    const fallbackFile = `${cacheBase}upload_${Date.now()}.jpg`;
    try {
      await FileSystem.copyAsync({ from: imageUri, to: fallbackFile });
      return fallbackFile;
    } catch {
      return imageUri;
    }
  }

  return imageUri;
}

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
  getList: async (params: PagedParams = {}): Promise<PagedResponse<CustomerGetDto>> => {
    const queryParams = buildQueryParams({
      sortBy: "Id",
      sortDirection: "asc",
      ...params,
    });
    const response = await apiClient.get<PagedApiResponse<CustomerGetDto>>("/api/Customer", {
      params: queryParams,
    });

    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Müşteri listesi alınamadı";
      throw new Error(msg);
    }

    return response.data.data;
  },

  getById: async (id: number): Promise<CustomerGetDto> => {
    const response = await apiClient.get<ApiResponse<CustomerGetDto>>(`/api/Customer/${id}`);

    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Müşteri bulunamadı";
      throw new Error(msg);
    }

    return response.data.data;
  },

  create: async (data: CreateCustomerDto): Promise<CustomerGetDto> => {
    const response = await apiClient.post<ApiResponse<CustomerGetDto>>("/api/Customer", data);

    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Müşteri oluşturulamadı";
      throw new Error(msg);
    }

    return response.data.data;
  },

  createFromMobile: async (data: CreateCustomerFromMobileDto): Promise<CreateCustomerFromMobileResultDto> => {
    const formData = new FormData();

    const appendIfPresent = (key: string, value: string | number | undefined | null) => {
      if (value === undefined || value === null) return;
      const normalized = typeof value === "string" ? value.trim() : String(value);
      if (!normalized) return;
      formData.append(key, normalized);
    };

    appendIfPresent("name", data.name);
    appendIfPresent("contactName", data.contactName);
    appendIfPresent("contactFirstName", data.contactFirstName);
    appendIfPresent("contactMiddleName", data.contactMiddleName);
    appendIfPresent("contactLastName", data.contactLastName);
    appendIfPresent("title", data.title);
    appendIfPresent("email", data.email);
    appendIfPresent("phone", data.phone);
    appendIfPresent("phone2", data.phone2);
    appendIfPresent("address", data.address);
    appendIfPresent("website", data.website);
    appendIfPresent("notes", data.notes);
    appendIfPresent("countryId", data.countryId);
    appendIfPresent("cityId", data.cityId);
    appendIfPresent("districtId", data.districtId);
    appendIfPresent("customerTypeId", data.customerTypeId);
    appendIfPresent("salesRepCode", data.salesRepCode);
    appendIfPresent("groupCode", data.groupCode);
    appendIfPresent("creditLimit", data.creditLimit);
    appendIfPresent("branchCode", data.branchCode);
    appendIfPresent("businessUnitCode", data.businessUnitCode);
    appendIfPresent("imageDescription", data.imageDescription);

    if (data.imageUri) {
      const readableUri = await ensureReadableUploadUri(data.imageUri);
      const fileMeta = getSafeUploadMeta(readableUri);
      formData.append("imageFile", {
        uri: fileMeta.uri,
        type: fileMeta.type,
        name: fileMeta.name,
      } as any);
    }

    const response = await apiClient.post<ApiResponse<CreateCustomerFromMobileResultDto>>(
      "/api/Customer/mobile/create-from-ocr",
      formData,
      {
        // OCR flow can include geocoding and image upload; keep timeout above the global default.
        timeout: 120000,
      }
    );

    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Mobil OCR müşteri oluşturma başarısız";
      throw new Error(msg);
    }

    return response.data.data;
  },

  update: async (id: number, data: UpdateCustomerDto): Promise<CustomerGetDto> => {
    const response = await apiClient.put<ApiResponse<CustomerGetDto>>(`/api/Customer/${id}`, data);

    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Müşteri güncellenemedi";
      throw new Error(msg);
    }

    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/Customer/${id}`);

    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Müşteri silinemedi";
      throw new Error(msg);
    }
  },

  uploadCustomerImage: async (
    customerId: number,
    imageUri: string,
    imageDescription?: string
  ): Promise<CustomerImageDto[]> => {
    const readableUri = await ensureReadableUploadUri(imageUri);
    const fileMeta = getSafeUploadMeta(readableUri);

    const formData = new FormData();
    formData.append("files", {
      uri: fileMeta.uri,
      type: fileMeta.type,
      name: fileMeta.name,
    } as any);

    if (imageDescription?.trim()) {
      formData.append("imageDescriptions", imageDescription.trim());
    }

    const response = await apiClient.post<ApiResponse<CustomerImageDto[]>>(`/api/CustomerImage/upload/${customerId}`, formData);

    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Müşteri görseli yüklenemedi";
      throw new Error(msg);
    }

    return response.data.data;
  },
};
