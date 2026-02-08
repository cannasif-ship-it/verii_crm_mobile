import { apiClient } from "../../../lib/axios";
import type { ApiResponse } from "../../auth/types";
import type { CariDto } from "../types";

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const normalizeCari = (raw: unknown): CariDto | null => {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;
  const subeKodu = toNumber(item.subeKodu ?? item.SubeKodu);
  const isletmeKodu = toNumber(item.isletmeKodu ?? item.IsletmeKodu);
  const cariKod = item.cariKod ?? item.CariKod;

  if (subeKodu == null || isletmeKodu == null || !cariKod) return null;

  return {
    subeKodu,
    isletmeKodu,
    cariKod: String(cariKod),
    cariIsim: (item.cariIsim ?? item.CariIsim ?? undefined) as string | undefined,
    cariTel: (item.cariTel ?? item.CariTel ?? undefined) as string | undefined,
    cariIl: (item.cariIl ?? item.CariIl ?? undefined) as string | undefined,
    cariAdres: (item.cariAdres ?? item.CariAdres ?? undefined) as string | undefined,
    cariIlce: (item.cariIlce ?? item.CariIlce ?? undefined) as string | undefined,
    ulkeKodu: (item.ulkeKodu ?? item.UlkeKodu ?? undefined) as string | undefined,
    email: (item.email ?? item.Email ?? undefined) as string | undefined,
    web: (item.web ?? item.Web ?? undefined) as string | undefined,
    vergiNumarasi: (item.vergiNumarasi ?? item.VergiNumarasi ?? undefined) as string | undefined,
    vergiDairesi: (item.vergiDairesi ?? item.VergiDairesi ?? undefined) as string | undefined,
    tcknNumber: (item.tcknNumber ?? item.TcknNumber ?? undefined) as string | undefined,
  };
};

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

    const payload = response.data.data as unknown;
    const rawItems = Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown[] }).items)
        ? (payload as { items: unknown[] }).items
        : payload && typeof payload === "object" && Array.isArray((payload as { Items?: unknown[] }).Items)
          ? (payload as { Items: unknown[] }).Items
          : [];

    return rawItems
      .map(normalizeCari)
      .filter((item): item is CariDto => item != null);
  },
};
