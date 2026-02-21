import { apiClient } from "../../../lib/axios";
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
      const fileName = data.imageUri.split("/").pop() || `customer_${Date.now()}.jpg`;
      const extension = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : "jpg";
      const mimeType =
        extension === "png"
          ? "image/png"
          : extension === "webp"
            ? "image/webp"
            : extension === "gif"
              ? "image/gif"
              : extension === "heic"
                ? "image/heic"
                : extension === "heif"
                  ? "image/heif"
                  : "image/jpeg";

      formData.append("imageFile", {
        uri: data.imageUri,
        type: mimeType,
        name: fileName,
      } as unknown as Blob);
    }

    const response = await apiClient.post<ApiResponse<CreateCustomerFromMobileResultDto>>(
      "/api/Customer/mobile/create-from-ocr",
      formData
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
    const fileName = imageUri.split("/").pop() || `customer_${Date.now()}.jpg`;
    const extension = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : "jpg";
    const mimeType =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : extension === "gif"
            ? "image/gif"
            : extension === "heic"
              ? "image/heic"
              : extension === "heif"
                ? "image/heif"
                : "image/jpeg";

    const formData = new FormData();
    formData.append("files", {
      uri: imageUri,
      type: mimeType,
      name: fileName,
    } as unknown as Blob);

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
