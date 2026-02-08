import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../constants/env";
import { ACCESS_TOKEN_KEY, BRANCH_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from "../constants/storage";
import { storage } from "./storage";
import type { ApiResponse, Branch } from "../features/auth/types";
import { useAuthStore } from "../store/auth";
import { router } from "expo-router";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
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
