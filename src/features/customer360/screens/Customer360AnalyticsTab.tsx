import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import {
  CurrencyTotalsTable,
  AmountComparisonTable,
  DistributionPieChart,
  MonthlyTrendLineChart,
  AmountComparisonBarChart,
} from "../components";
import type {
  Customer360AnalyticsSummaryDto,
  Customer360AnalyticsChartsDto,
  Customer360CurrencyAmountDto,
} from "../types";
import {
  AnalyticsUpIcon,
  Calendar03Icon,
  Invoice03Icon,
  ShoppingBag03Icon,
  Activity01Icon,
  Alert02Icon,
} from "hugeicons-react-native";

interface Customer360AnalyticsTabProps {
  summary: Customer360AnalyticsSummaryDto | undefined;
  charts: Customer360AnalyticsChartsDto | undefined;
  colors: Record<string, string>;
  isSingleCurrency: boolean;
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
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  titleText: string;
  mutedText: string;
  cardBg: string;
  cardBorder: string;
}

function MetricCard({
  icon,
  label,
  value,
  titleText,
  mutedText,
  cardBg,
  cardBorder,
}: MetricCardProps): React.ReactElement {
  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
      ]}
    >
      <View style={styles.metricTopRow}>
        <View style={styles.metricIconWrap}>{icon}</View>
        <Text style={[styles.metricLabel, { color: mutedText }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <Text style={[styles.metricValue, { color: titleText }]} numberOfLines={2}>
        {String(value)}
      </Text>
    </View>
  );
}

export function Customer360AnalyticsTab({
  summary,
  charts,
  colors,
  isSingleCurrency,
  summaryError,
  chartsError,
}: Customer360AnalyticsTabProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const { themeMode } = useUIStore();

  const isDark = themeMode === "dark";
  const locale =
    i18n.language === "tr" ? "tr-TR" : i18n.language === "de" ? "de-DE" : "en-US";

  const formatAmountCb = useCallback(
    (v: number) => formatAmount(v, locale),
    [locale]
  );

  const noDataKey = t("common.noData");
  const totalsByCurrency: Customer360CurrencyAmountDto[] =
    summary?.totalsByCurrency ?? [];
  const amountComparisonByCurrency =
    charts?.amountComparisonByCurrency ?? [];

  const titleText = isDark ? "#FFFFFF" : "#1F2937";
  const mutedText = isDark ? "rgba(255,255,255,0.58)" : "#6B7280";
  const softText = isDark ? "rgba(255,255,255,0.42)" : "#94A3B8";
  const accent = isDark ? "#EC4899" : "#DB2777";
  const accentSecondary = isDark ? "#F97316" : "#F59E0B";
  const cardBg = isDark ? "rgba(19,11,27,0.72)" : "rgba(255,245,248,0.84)";
  const cardBgAlt = isDark ? "rgba(18,8,25,0.78)" : "rgba(255,250,252,0.86)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(219,39,119,0.08)";
  const sectionTitleColor = isDark ? "#F8FAFC" : "#334155";
  const errorColor = colors.error;

  if (summaryError) {
    return (
      <View style={styles.centered}>
        <View
          style={[
            styles.stateCard,
            {
              backgroundColor: cardBgAlt,
              borderColor: cardBorder,
            },
          ]}
        >
          <View
            style={[
              styles.stateIconWrap,
              {
                backgroundColor: `${errorColor}12`,
                borderColor: `${errorColor}22`,
              },
            ]}
          >
            <Alert02Icon size={20} color={errorColor} variant="stroke" />
          </View>
          <Text style={[styles.errorText, { color: errorColor }]}>
            {t("customer360.analytics.error")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatListScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {isSingleCurrency ? (
        <>
          <View style={styles.metricsGrid}>
            <MetricCard
              icon={<AnalyticsUpIcon size={14} color={accent} variant="stroke" />}
              label={t("customer360.analytics.last12MonthsOrderAmount")}
              value={formatAmountCb(summary?.last12MonthsOrderAmount ?? 0)}
              titleText={titleText}
              mutedText={mutedText}
              cardBg={cardBg}
              cardBorder={cardBorder}
            />
            <MetricCard
              icon={<Invoice03Icon size={14} color={accentSecondary} variant="stroke" />}
              label={t("customer360.analytics.openQuotationAmount")}
              value={formatAmountCb(summary?.openQuotationAmount ?? 0)}
              titleText={titleText}
              mutedText={mutedText}
              cardBg={cardBg}
              cardBorder={cardBorder}
            />
            <MetricCard
              icon={<ShoppingBag03Icon size={14} color={accent} variant="stroke" />}
              label={t("customer360.analytics.openOrderAmount")}
              value={formatAmountCb(summary?.openOrderAmount ?? 0)}
              titleText={titleText}
              mutedText={mutedText}
              cardBg={cardBg}
              cardBorder={cardBorder}
            />
            <MetricCard
              icon={<Activity01Icon size={14} color={accentSecondary} variant="stroke" />}
              label={t("customer360.analytics.activityCount")}
              value={summary?.activityCount ?? 0}
              titleText={titleText}
              mutedText={mutedText}
              cardBg={cardBg}
              cardBorder={cardBorder}
            />
            <MetricCard
              icon={<Calendar03Icon size={14} color={accent} variant="stroke" />}
              label={t("customer360.analytics.lastActivityDate")}
              value={formatDateOnly(summary?.lastActivityDate, locale)}
              titleText={titleText}
              mutedText={mutedText}
              cardBg={cardBg}
              cardBorder={cardBorder}
            />
          </View>
        </>
      ) : totalsByCurrency.length > 0 ? (
        <View
          style={[
            styles.sectionWrap,
            {
              backgroundColor: cardBgAlt,
              borderColor: cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
            {t("customer360.currencyTotals.title")}
          </Text>
          <CurrencyTotalsTable
            items={totalsByCurrency}
            colors={colors}
            formatAmount={formatAmountCb}
            title={t("customer360.currencyTotals.title")}
            currencyLabel={t("customer360.currencyTotals.currency")}
            demandAmountLabel={t("customer360.currencyTotals.demandAmount")}
            quotationAmountLabel={t("customer360.currencyTotals.quotationAmount")}
            orderAmountLabel={t("customer360.currencyTotals.orderAmount")}
            noDataKey={noDataKey}
          />
        </View>
      ) : null}

      {amountComparisonByCurrency.length > 0 ? (
        <View
          style={[
            styles.sectionWrap,
            {
              backgroundColor: cardBgAlt,
              borderColor: cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
            {t("customer360.analyticsCharts.amountComparisonTitle")}
          </Text>
          <AmountComparisonTable
            items={amountComparisonByCurrency}
            colors={colors}
            formatAmount={formatAmountCb}
            title={t("customer360.analyticsCharts.amountComparisonTitle")}
            currencyLabel={t("customer360.currencyTotals.currency")}
            last12Label={t("customer360.analyticsCharts.last12MonthsOrderAmount")}
            openQuotationLabel={t("customer360.analyticsCharts.openQuotationAmount")}
            openOrderLabel={t("customer360.analyticsCharts.openOrderAmount")}
            noDataKey={noDataKey}
          />
        </View>
      ) : null}

      {chartsError ? (
        <View style={styles.chartError}>
          <View
            style={[
              styles.stateCard,
              {
                backgroundColor: cardBgAlt,
                borderColor: cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.stateIconWrap,
                {
                  backgroundColor: `${errorColor}12`,
                  borderColor: `${errorColor}22`,
                },
              ]}
            >
              <Alert02Icon size={20} color={errorColor} variant="stroke" />
            </View>
            <Text style={[styles.errorText, { color: errorColor }]}>
              {t("customer360.analytics.error")}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.sectionWrap,
              {
                backgroundColor: cardBgAlt,
                borderColor: cardBorder,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
              {t("customer360.analyticsCharts.distributionTitle")}
            </Text>
            <Text style={[styles.sectionSubTitle, { color: softText }]}>
              {t("customer360.analyticsCharts.demand")} · {t("customer360.analyticsCharts.quotation")} · {t("customer360.analyticsCharts.order")}
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
              demandLabel={t("customer360.analyticsCharts.demand")}
              quotationLabel={t("customer360.analyticsCharts.quotation")}
              orderLabel={t("customer360.analyticsCharts.order")}
            />
          </View>

          <View
            style={[
              styles.sectionWrap,
              {
                backgroundColor: cardBgAlt,
                borderColor: cardBorder,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
              {t("customer360.analyticsCharts.monthlyTrendTitle")}
            </Text>
            <Text style={[styles.sectionSubTitle, { color: softText }]}>
              {t("customer360.analyticsCharts.demand")} · {t("customer360.analyticsCharts.quotation")} · {t("customer360.analyticsCharts.order")}
            </Text>
            <MonthlyTrendLineChart
              data={charts?.monthlyTrend ?? []}
              colors={colors}
              noDataKey={noDataKey}
              demandLabel={t("customer360.analyticsCharts.demand")}
              quotationLabel={t("customer360.analyticsCharts.quotation")}
              orderLabel={t("customer360.analyticsCharts.order")}
            />
          </View>

          {isSingleCurrency ? (
            <View
              style={[
                styles.sectionWrap,
                {
                  backgroundColor: cardBgAlt,
                  borderColor: cardBorder,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                {t("customer360.analyticsCharts.amountComparisonTitle")}
              </Text>
              <Text style={[styles.sectionSubTitle, { color: softText }]}>
                {t("customer360.analyticsCharts.last12MonthsOrderAmount")} · {t("customer360.analyticsCharts.openQuotationAmount")} · {t("customer360.analyticsCharts.openOrderAmount")}
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
                last12Label={t("customer360.analyticsCharts.last12MonthsOrderAmount")}
                openQuotationLabel={t("customer360.analyticsCharts.openQuotationAmount")}
                openOrderLabel={t("customer360.analyticsCharts.openOrderAmount")}
                formatAmount={formatAmountCb}
              />
            </View>
          ) : null}
        </>
      )}
    </FlatListScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingTop: 2,
    paddingBottom: 110,
    gap: 10,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 2,
  },
  metricCard: {
    width: "48%",
    minHeight: 94,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    justifyContent: "space-between",
  },
  metricTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 13,
    marginTop: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    marginTop: 10,
  },
  sectionWrap: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  sectionSubTitle: {
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 14,
    marginTop: -2,
    marginBottom: 2,
  },
  chartError: {
    paddingVertical: 4,
  },
  stateCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  stateIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
});