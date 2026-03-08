import { apiClient } from "../../../lib/axios";
import i18next from "i18next";
import type {
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  BranchListResponse,
  Branch,
  BranchErp,
} from "../types";

const mapBranch = (branch: BranchErp): Branch => ({
  id: String(branch.subeKodu),
  name: branch.unvan && branch.unvan.trim().length > 0 ? branch.unvan : "-",
  code: String(branch.subeKodu),
});

export const authApi = {
  getBranches: async (): Promise<Branch[]> => {
    try {
      const response = await apiClient.get<BranchListResponse>("/api/Erp/getBranches");

      if (!response.data.success) {
        const errorMessage =
          response.data.message ||
          response.data.exceptionMessage ||
          (response.data.errors && response.data.errors.length > 0
            ? response.data.errors.join(", ")
            : i18next.t("api.errors.branchListFailed", "Şube listesi alınamadı"));
        throw new Error(errorMessage);
      }

      return response.data.data.map(mapBranch);
    } catch (error: any) {
      const finalMessage = error.message || i18next.t("api.errors.serverConnection", "Sunucu ile bağlantı kurulamadı.");
      throw new Error(finalMessage);
    }
  },

  login: async (data: LoginRequest): Promise<LoginResponseData> => {
    try {
      const response = await apiClient.post<LoginResponse>("/api/auth/login", data);

      if (!response.data.success) {
        const errorMessage =
          response.data.message ||
          response.data.exceptionMessage ||
          (response.data.errors && response.data.errors.length > 0
            ? response.data.errors.join(", ")
            : i18next.t("auth.loginFailed", "Giriş başarısız"));
        throw new Error(errorMessage);
      }

      return response.data.data;
    } catch (error: any) {
      const finalMessage = error.message || i18next.t("auth.loginFailedMessage", "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      throw new Error(finalMessage);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
    }
  },
};