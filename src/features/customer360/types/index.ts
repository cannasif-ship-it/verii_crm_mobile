export interface Customer360ProfileDto {
  id: number;
  name: string;
  customerCode?: string | null;
}

export interface Customer360KpiDto {
  totalDemands: number;
  totalQuotations: number;
  totalOrders: number;
  openQuotations: number;
  openOrders: number;
  lastActivityDate?: string | null;
}

export interface Customer360SimpleItemDto {
  id: number;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  amount?: number | null;
  date?: string | null;
}

export interface Customer360TimelineItemDto {
  itemId: number;
  date: string;
  type?: string | null;
  title: string;
  status?: string | null;
  amount?: number | null;
}

export interface Customer360OverviewDto {
  profile: Customer360ProfileDto;
  kpis: Customer360KpiDto;
  contacts: Customer360SimpleItemDto[];
  shippingAddresses: Customer360SimpleItemDto[];
  recentDemands: Customer360SimpleItemDto[];
  recentQuotations: Customer360SimpleItemDto[];
  recentOrders: Customer360SimpleItemDto[];
  recentActivities: Customer360SimpleItemDto[];
  timeline: Customer360TimelineItemDto[];
}

export interface Customer360AnalyticsSummaryDto {
  last12MonthsOrderAmount: number;
  openQuotationAmount: number;
  openOrderAmount: number;
  lastActivityDate?: string | null;
  activityCount: number;
}

export interface Customer360MonthlyTrendItemDto {
  month: string;
  demandCount: number;
  quotationCount: number;
  orderCount: number;
}

export interface Customer360DistributionDto {
  demandCount: number;
  quotationCount: number;
  orderCount: number;
}

export interface Customer360AmountComparisonDto {
  last12MonthsOrderAmount: number;
  openQuotationAmount: number;
  openOrderAmount: number;
}

export interface Customer360AnalyticsChartsDto {
  monthlyTrend: Customer360MonthlyTrendItemDto[];
  distribution: Customer360DistributionDto;
  amountComparison: Customer360AmountComparisonDto;
}
