import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../constants/config";
import { ACCESS_TOKEN_KEY, BRANCH_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from "../constants/storage";
import { storage } from "./storage";
import type { ApiResponse, Branch } from "../features/auth/types";
import { useAuthStore } from "../store/auth";
import { router } from "expo-router";

type MutableHeaders = InternalAxiosRequestConfig["headers"] & {
  delete?: (name: string) => void;
  set?: (name: string, value: string | undefined) => void;
};

function clearContentType(headers: MutableHeaders): void {
  // AxiosHeaders keeps an internal map; prefer API methods over bracket delete.
  if (typeof headers.delete === "function") {
    headers.delete("Content-Type");
    headers.delete("content-type");
  }
  if (typeof headers.set === "function") {
    headers.set("Content-Type", undefined);
    headers.set("content-type", undefined);
  }
  delete headers["Content-Type"];
  delete headers["content-type"];
}

function isFormDataPayload(data: unknown): boolean {
  if (!data) return false;
  if (typeof FormData !== "undefined" && data instanceof FormData) return true;

  // In release builds, FormData may come from a different JS/runtime boundary.
  // Be permissive: if it behaves like FormData (append), treat it as multipart.
  const candidate = data as {
    append?: unknown;
    getParts?: unknown;
    _parts?: unknown;
    [Symbol.toStringTag]?: unknown;
  };
  if (typeof candidate.append === "function") return true;

  // Extra fallback for runtimes where FormData crosses JS boundaries.
  return (
    candidate?.[Symbol.toStringTag] === "FormData" ||
    typeof candidate.getParts === "function" ||
    Array.isArray(candidate._parts)
  );
}

function applyContentTypeByPayload(config: InternalAxiosRequestConfig): void {
  const headers = config.headers as MutableHeaders;
  const multipart = isFormDataPayload(config.data);
  if (multipart) {
    // Let axios/native networking layer generate multipart boundary automatically.
    clearContentType(headers);
    return;
  }

  if (!headers["Content-Type"] && !headers["content-type"]) {
    if (typeof headers.set === "function") {
      headers.set("Content-Type", "application/json");
    } else {
      headers["Content-Type"] = "application/json";
    }
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.get<string>(ACCESS_TOKEN_KEY);
    const branch = await storage.get<Branch>(BRANCH_STORAGE_KEY);
    const language = await storage.get<string>(LANGUAGE_STORAGE_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["X-Language"] = language || "tr";

    const branchCode = branch?.code;
    if (branchCode !== undefined && branchCode !== null && String(branchCode).trim() !== "") {
      const normalizedBranchCode = String(branchCode);
      config.headers["X-Branch-Code"] = normalizedBranchCode;
      config.headers.BranchCode = normalizedBranchCode;
    }

    applyContentTypeByPayload(config);

    if (__DEV__) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      const payload = response.data as { data?: unknown; success?: boolean } | undefined;
      const pageData = payload?.data as { items?: unknown[]; Items?: unknown[]; totalCount?: number; TotalCount?: number } | undefined;
      const itemsCount = Array.isArray(pageData?.items)
        ? pageData?.items.length
        : Array.isArray(pageData?.Items)
          ? pageData?.Items.length
          : undefined;

      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        success: payload?.success,
        itemsCount,
        totalCount: pageData?.totalCount ?? pageData?.TotalCount,
      });
    }
    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().clearAuth();
      router.replace("/(auth)/login");
    }

    let errorMessage = "Bir hata oluştu";

    if (error.response?.data) {
      const responseData = error.response.data;
      if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.exceptionMessage) {
        errorMessage = responseData.exceptionMessage;
      } else if (responseData.errors && responseData.errors.length > 0) {
        errorMessage = responseData.errors.join(", ");
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage) as Error & {
      response: typeof error.response;
      status: number | undefined;
    };
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;

    return Promise.reject(enhancedError);
  }
);
