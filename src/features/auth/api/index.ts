import { apiClient } from "../../../lib/axios";
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
    const response = await apiClient.get<BranchListResponse>("/api/Erp/getBranches");

    if (!response.data.success) {
      const errorMessage =
        response.data.message ||
        response.data.exceptionMessage ||
        (response.data.errors && response.data.errors.length > 0
          ? response.data.errors.join(", ")
          : "Şube listesi alınamadı");
      throw new Error(errorMessage);
    }

    return response.data.data.map(mapBranch);
  },

  login: async (data: LoginRequest): Promise<LoginResponseData> => {
    const response = await apiClient.post<LoginResponse>("/api/auth/login", data);

    if (!response.data.success) {
      const errorMessage =
        response.data.message ||
        response.data.exceptionMessage ||
        (response.data.errors && response.data.errors.length > 0
          ? response.data.errors.join(", ")
          : "Giriş başarısız");
      throw new Error(errorMessage);
    }

    return response.data.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
    }
  },
};
