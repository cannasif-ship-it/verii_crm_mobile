import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import {
  KpiCard,
  DistributionPieChart,
  MonthlyTrendLineChart,
  AmountComparisonBarChart,
} from "../components";
import type {
  Customer360AnalyticsSummaryDto,
  Customer360AnalyticsChartsDto,
} from "../types";

interface Customer360AnalyticsTabProps {
  summary: Customer360AnalyticsSummaryDto | undefined;
  charts: Customer360AnalyticsChartsDto | undefined;
  colors: Record<string, string>;
  isSummaryLoading: boolean;
  isChartsLoading: boolean;
  summaryError: Error | null;
  chartsError: Error | null;
}

function formatAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateOnly(
  dateStr: string | null | undefined,
  locale: string
): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function Customer360AnalyticsTab({
  summary,
  charts,
  colors,
  summaryError,
  chartsError,
}: Customer360AnalyticsTabProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";

  const formatAmountCb = useCallback(
    (v: number) => formatAmount(v, locale),
    [locale]
  );

  if (summaryError) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {t("customer360.analytics.error")}
        </Text>
      </View>
    );
  }

  const last12 = summary?.last12MonthsOrderAmount ?? 0;
  const openQuot = summary?.openQuotationAmount ?? 0;
  const openOrd = summary?.openOrderAmount ?? 0;
  const activityCount = summary?.activityCount ?? 0;
  const lastActivityDate = formatDateOnly(
    summary?.lastActivityDate,
    locale
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            {t("customer360.analytics.last12MonthsOrderAmount")}
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatAmountCb(last12)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            {t("customer360.analytics.openQuotationAmount")}
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatAmountCb(openQuot)}
          </Text>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            {t("customer360.analytics.openOrderAmount")}
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatAmountCb(openOrd)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            {t("customer360.analytics.activityCount")}
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {activityCount}
          </Text>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            {t("customer360.analytics.lastActivityDate")}
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {lastActivityDate}
          </Text>
        </View>
      </View>

      {chartsError ? (
        <View style={styles.chartError}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {t("customer360.analytics.error")}
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            {t("customer360.analyticsCharts.distributionTitle")}
          </Text>
          <DistributionPieChart
            data={charts?.distribution ?? { demandCount: 0, quotationCount: 0, orderCount: 0 }}
            colors={colors}
            noDataKey={t("common.noData")}
            demandLabel={t("customer360.analyticsCharts.demand")}
            quotationLabel={t("customer360.analyticsCharts.quotation")}
            orderLabel={t("customer360.analyticsCharts.order")}
          />
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            {t("customer360.analyticsCharts.monthlyTrendTitle")}
          </Text>
          <MonthlyTrendLineChart
            data={charts?.monthlyTrend ?? []}
            colors={colors}
            noDataKey={t("common.noData")}
            demandLabel={t("customer360.analyticsCharts.demand")}
            quotationLabel={t("customer360.analyticsCharts.quotation")}
            orderLabel={t("customer360.analyticsCharts.order")}
          />
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            {t("customer360.analyticsCharts.amountComparisonTitle")}
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
            noDataKey={t("common.noData")}
            last12Label={t("customer360.analyticsCharts.last12MonthsOrderAmount")}
            openQuotationLabel={t("customer360.analyticsCharts.openQuotationAmount")}
            openOrderLabel={t("customer360.analyticsCharts.openOrderAmount")}
            formatAmount={formatAmountCb}
          />
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
  summaryCard: {
    flex: 1,
    minWidth: 140,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
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
