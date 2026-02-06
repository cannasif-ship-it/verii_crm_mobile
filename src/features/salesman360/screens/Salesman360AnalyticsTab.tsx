import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import {
  KpiCard,
  AmountComparisonTable,
  DistributionPieChart,
  MonthlyTrendLineChart,
  AmountComparisonBarChart,
} from "../components";
import type {
  Salesmen360AnalyticsSummaryDto,
  Salesmen360AnalyticsChartsDto,
  Salesmen360CurrencyAmountDto,
} from "../types";

interface Salesman360AnalyticsTabProps {
  summary: Salesmen360AnalyticsSummaryDto | undefined;
  charts: Salesmen360AnalyticsChartsDto | undefined;
  colors: Record<string, string>;
  isSingleCurrency: boolean;
  summaryError: Error | null;
  chartsError: Error | null;
  isSummaryLoading: boolean;
  isChartsLoading: boolean;
}

function formatAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateOnly(dateStr: string | null | undefined, locale: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function Salesman360AnalyticsTab({
  summary,
  charts,
  colors,
  isSingleCurrency,
  summaryError,
  chartsError,
}: Salesman360AnalyticsTabProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
  const formatAmountCb = useCallback(
    (v: number) => formatAmount(v, locale),
    [locale]
  );

  const noDataKey = t("common.noData");
  const amountComparisonByCurrency = charts?.amountComparisonByCurrency ?? [];
  const totalsByCurrency: Salesmen360CurrencyAmountDto[] = summary?.totalsByCurrency ?? [];

  if (summaryError) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {t("salesman360.analytics.error")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {isSingleCurrency ? (
        <>
          <View style={styles.summaryRow}>
            <KpiCard
              label={t("salesman360.analytics.last12MonthsOrderAmount")}
              value={formatAmountCb(summary?.last12MonthsOrderAmount ?? 0)}
              colors={colors}
            />
            <KpiCard
              label={t("salesman360.analytics.openQuotationAmount")}
              value={formatAmountCb(summary?.openQuotationAmount ?? 0)}
              colors={colors}
            />
          </View>
          <View style={styles.summaryRow}>
            <KpiCard
              label={t("salesman360.analytics.openOrderAmount")}
              value={formatAmountCb(summary?.openOrderAmount ?? 0)}
              colors={colors}
            />
            <KpiCard
              label={t("salesman360.analytics.activityCount")}
              value={summary?.activityCount ?? 0}
              colors={colors}
            />
          </View>
          <View style={styles.summaryRow}>
            <KpiCard
              label={t("salesman360.analytics.lastActivityDate")}
              value={formatDateOnly(summary?.lastActivityDate, locale)}
              colors={colors}
            />
          </View>
        </>
      ) : (
        totalsByCurrency.length > 0 && (
          <View style={styles.kpiRow}>
            {totalsByCurrency.map((row) => (
              <View
                key={row.currency}
                style={[styles.currencyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <Text style={[styles.currencyCardTitle, { color: colors.textMuted }]}>
                  {row.currency}
                </Text>
                <Text style={[styles.currencyCardValue, { color: colors.text }]}>
                  {formatAmountCb(row.orderAmount)}
                </Text>
                <Text style={[styles.currencyCardLabel, { color: colors.textMuted }]}>
                  {t("salesman360.currencyTotals.orderAmount")}
                </Text>
              </View>
            ))}
          </View>
        )
      )}

      {amountComparisonByCurrency.length > 0 ? (
        <AmountComparisonTable
          items={amountComparisonByCurrency}
          colors={colors}
          formatAmount={formatAmountCb}
          title={t("salesman360.analyticsCharts.amountComparisonTitle")}
          currencyLabel={t("salesman360.currencyTotals.currency")}
          last12Label={t("salesman360.analyticsCharts.last12MonthsOrderAmount")}
          openQuotationLabel={t("salesman360.analyticsCharts.openQuotationAmount")}
          openOrderLabel={t("salesman360.analyticsCharts.openOrderAmount")}
          noDataKey={noDataKey}
        />
      ) : null}

      {chartsError ? (
        <View style={styles.chartError}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {t("salesman360.analytics.error")}
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            {t("salesman360.analyticsCharts.distributionTitle")}
          </Text>
          <DistributionPieChart
            data={
              charts?.distribution ?? {
                demandCount: 0,
                quotationCount: 0,
                orderCount: 0,
              }
            }
            colors={colors}
            noDataKey={noDataKey}
            demandLabel={t("salesman360.analyticsCharts.demand")}
            quotationLabel={t("salesman360.analyticsCharts.quotation")}
            orderLabel={t("salesman360.analyticsCharts.order")}
          />
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            {t("salesman360.analyticsCharts.monthlyTrendTitle")}
          </Text>
          <MonthlyTrendLineChart
            data={charts?.monthlyTrend ?? []}
            colors={colors}
            noDataKey={noDataKey}
            demandLabel={t("salesman360.analyticsCharts.demand")}
            quotationLabel={t("salesman360.analyticsCharts.quotation")}
            orderLabel={t("salesman360.analyticsCharts.order")}
          />
          {isSingleCurrency ? (
            <>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                {t("salesman360.analyticsCharts.amountComparisonTitle")}
              </Text>
              <AmountComparisonBarChart
                data={
                  charts?.amountComparison ?? {
                    last12MonthsOrderAmount: 0,
                    openQuotationAmount: 0,
                    openOrderAmount: 0,
                  }
                }
                colors={colors}
                noDataKey={noDataKey}
                last12Label={t("salesman360.analyticsCharts.last12MonthsOrderAmount")}
                openQuotationLabel={t("salesman360.analyticsCharts.openQuotationAmount")}
                openOrderLabel={t("salesman360.analyticsCharts.openOrderAmount")}
                formatAmount={formatAmountCb}
              />
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  currencyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
  },
  currencyCardTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  currencyCardValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  currencyCardLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  chartError: {
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
});
