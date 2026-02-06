import { apiClient } from "../../../lib/axios";
import type { ApiResponse } from "../../auth/types";
import type {
  Customer360OverviewDto,
  Customer360AnalyticsSummaryDto,
  Customer360AnalyticsChartsDto,
} from "../types";

const CUSTOMER_360_STALE_MS = 30 * 1000;

function getOverviewPath(customerId: number): string {
  return `/api/customers/${customerId}/overview`;
}

function getAnalyticsSummaryPath(customerId: number): string {
  return `/api/customers/${customerId}/analytics/summary`;
}

function getAnalyticsChartsPath(customerId: number, months: number): string {
  return `/api/customers/${customerId}/analytics/charts`;
}

export const customer360Api = {
  getOverview: async (customerId: number): Promise<Customer360OverviewDto> => {
    const response = await apiClient.get<ApiResponse<Customer360OverviewDto>>(
      getOverviewPath(customerId)
    );
    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Özet yüklenemedi";
      throw new Error(msg);
    }
    return response.data.data;
  },

  getAnalyticsSummary: async (
    customerId: number
  ): Promise<Customer360AnalyticsSummaryDto> => {
    const response = await apiClient.get<
      ApiResponse<Customer360AnalyticsSummaryDto>
    >(getAnalyticsSummaryPath(customerId));
    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Analitik özet yüklenemedi";
      throw new Error(msg);
    }
    return response.data.data;
  },

  getAnalyticsCharts: async (
    customerId: number,
    months: number = 12
  ): Promise<Customer360AnalyticsChartsDto> => {
    const response = await apiClient.get<
      ApiResponse<Customer360AnalyticsChartsDto>
    >(getAnalyticsChartsPath(customerId, months), { params: { months } });
    if (!response.data.success) {
      const msg =
        [response.data.message, response.data.exceptionMessage].filter(Boolean).join(" — ") ||
        "Grafik verisi yüklenemedi";
      throw new Error(msg);
    }
    return response.data.data;
  },
};

export { CUSTOMER_360_STALE_MS };
