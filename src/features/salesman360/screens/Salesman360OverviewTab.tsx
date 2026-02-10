import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useTranslation } from "react-i18next";
import { KpiCard, CurrencyTotalsTable } from "../components";
import type { Salesmen360OverviewDto } from "../types";

interface Salesman360OverviewTabProps {
  data: Salesmen360OverviewDto | undefined;
  colors: Record<string, string>;
  isSingleCurrency: boolean;
}

function formatAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function Salesman360OverviewTab({
  data,
  colors,
  isSingleCurrency,
}: Salesman360OverviewTabProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
  const formatAmountCb = useCallback(
    (v: number) => formatAmount(v, locale),
    [locale]
  );

  const kpis = data?.kpis ?? {
    currency: null,
    totalDemands: 0,
    totalQuotations: 0,
    totalOrders: 0,
    totalActivities: 0,
    totalDemandAmount: 0,
    totalQuotationAmount: 0,
    totalOrderAmount: 0,
    totalsByCurrency: [],
  };
  const totalsByCurrency = kpis.totalsByCurrency ?? [];
  const noDataKey = t("common.noData");

  return (
    <FlatListScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.kpiRow}>
        <KpiCard
          label={t("salesman360.kpi.totalDemands")}
          value={kpis.totalDemands}
          colors={colors}
        />
        <KpiCard
          label={t("salesman360.kpi.totalQuotations")}
          value={kpis.totalQuotations}
          colors={colors}
        />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard
          label={t("salesman360.kpi.totalOrders")}
          value={kpis.totalOrders}
          colors={colors}
        />
        <KpiCard
          label={t("salesman360.kpi.totalActivities")}
          value={kpis.totalActivities}
          colors={colors}
        />
      </View>
      {isSingleCurrency ? (
        <View style={styles.kpiRow}>
          <KpiCard
            label={t("salesman360.kpi.totalDemandAmount")}
            value={formatAmountCb(kpis.totalDemandAmount)}
            colors={colors}
          />
          <KpiCard
            label={t("salesman360.kpi.totalQuotationAmount")}
            value={formatAmountCb(kpis.totalQuotationAmount)}
            colors={colors}
          />
          <KpiCard
            label={t("salesman360.kpi.totalOrderAmount")}
            value={formatAmountCb(kpis.totalOrderAmount)}
            colors={colors}
          />
        </View>
      ) : null}
      <CurrencyTotalsTable
        items={totalsByCurrency}
        colors={colors}
        formatAmount={formatAmountCb}
        title={t("salesman360.currencyTotals.title")}
        currencyLabel={t("salesman360.currencyTotals.currency")}
        demandAmountLabel={t("salesman360.currencyTotals.demandAmount")}
        quotationAmountLabel={t("salesman360.currencyTotals.quotationAmount")}
        orderAmountLabel={t("salesman360.currencyTotals.orderAmount")}
        noDataKey={noDataKey}
      />
    </FlatListScrollView>
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
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
});
