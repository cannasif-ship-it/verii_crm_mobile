import { apiClient } from "../../../lib/axios";
import type { ApiResponse } from "../../auth/types";
import type { CariDto } from "../types";

export const erpCustomerApi = {
  getCaris: async (cariKodu?: string | null): Promise<CariDto[]> => {
    const params: Record<string, string> = {};
    if (cariKodu) {
      params.cariKodu = cariKodu;
    }

    const response = await apiClient.get<ApiResponse<CariDto[]>>("/api/Erp/getAllCustomers", {
      params,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || response.data.exceptionMessage || "ERP müşteri listesi alınamadı"
      );
    }

    return response.data.data;
  },
};
