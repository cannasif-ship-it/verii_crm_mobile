export interface Salesmen360CurrencyAmountDto {
  currency: string;
  demandAmount: number;
  quotationAmount: number;
  orderAmount: number;
}

export interface Salesmen360KpiDto {
  currency?: string | null;
  totalDemands: number;
  totalQuotations: number;
  totalOrders: number;
  totalActivities: number;
  totalDemandAmount: number;
  totalQuotationAmount: number;
  totalOrderAmount: number;
  totalsByCurrency?: Salesmen360CurrencyAmountDto[];
}

export interface Salesmen360OverviewDto {
  userId: number;
  fullName: string;
  email?: string | null;
  kpis: Salesmen360KpiDto;
}

export interface Salesmen360AnalyticsSummaryDto {
  currency?: string | null;
  last12MonthsOrderAmount: number;
  openQuotationAmount: number;
  openOrderAmount: number;
  lastActivityDate?: string | null;
  activityCount: number;
  totalsByCurrency?: Salesmen360CurrencyAmountDto[];
}

export interface Salesmen360MonthlyTrendItemDto {
  month: string;
  demandCount: number;
  quotationCount: number;
  orderCount: number;
}

export interface Salesmen360DistributionDto {
  demandCount: number;
  quotationCount: number;
  orderCount: number;
}

export interface Salesmen360AmountComparisonDto {
  currency?: string | null;
  last12MonthsOrderAmount: number;
  openQuotationAmount: number;
  openOrderAmount: number;
}

export interface Salesmen360AnalyticsChartsDto {
  monthlyTrend: Salesmen360MonthlyTrendItemDto[];
  distribution: Salesmen360DistributionDto;
  amountComparison: Salesmen360AmountComparisonDto;
  amountComparisonByCurrency?: Salesmen360AmountComparisonDto[];
}
