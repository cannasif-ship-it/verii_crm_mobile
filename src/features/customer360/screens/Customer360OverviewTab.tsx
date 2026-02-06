import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import {
  KpiCard,
  SectionCard,
  TimelineSection,
} from "../components";
import type { Customer360OverviewDto } from "../types";

interface Customer360OverviewTabProps {
  data: Customer360OverviewDto | undefined;
  colors: Record<string, string>;
  isFetching: boolean;
}

function formatDate(
  dateStr: string | null | undefined,
  locale: string
): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function Customer360OverviewTab({
  data,
  colors,
}: Customer360OverviewTabProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";

  const profile = data?.profile ?? { id: 0, name: "", customerCode: null };
  const kpis = data?.kpis ?? {
    totalDemands: 0,
    totalQuotations: 0,
    totalOrders: 0,
    openQuotations: 0,
    openOrders: 0,
    lastActivityDate: null,
  };
  const contacts = data?.contacts ?? [];
  const shippingAddresses = data?.shippingAddresses ?? [];
  const recentDemands = data?.recentDemands ?? [];
  const recentQuotations = data?.recentQuotations ?? [];
  const recentOrders = data?.recentOrders ?? [];
  const recentActivities = data?.recentActivities ?? [];
  const timeline = data?.timeline ?? [];

  const formatDateCb = useCallback(
    (d: string | null | undefined) => formatDate(d, locale),
    [locale]
  );
  const formatDateTimeCb = useCallback(
    (d: string) => formatDateTime(d, locale),
    [locale]
  );
  const formatAmountCb = useCallback(
    (v: number) => formatAmount(v, locale),
    [locale]
  );
  const getStatusLabel = useCallback(
    (status: string | null | undefined): string => {
      if (status == null || status === "") return "";
      const key = `customer360.status.${status}`;
      const translated = t(key);
      return translated !== key ? translated : status;
    },
    [t]
  );

  const noDataKey = t("common.noData");

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.kpiRow}>
        <KpiCard
          label={t("customer360.kpi.totalDemands")}
          value={kpis.totalDemands}
          colors={colors}
        />
        <KpiCard
          label={t("customer360.kpi.totalQuotations")}
          value={kpis.totalQuotations}
          colors={colors}
        />
        <KpiCard
          label={t("customer360.kpi.totalOrders")}
          value={kpis.totalOrders}
          colors={colors}
        />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard
          label={t("customer360.kpi.openQuotations")}
          value={kpis.openQuotations}
          colors={colors}
        />
        <KpiCard
          label={t("customer360.kpi.openOrders")}
          value={kpis.openOrders}
          colors={colors}
        />
      </View>

      <SectionCard
        title={t("customer360.sections.contacts")}
        items={contacts}
        colors={colors}
        noDataKey={noDataKey}
        formatDate={formatDateCb}
      />
      <SectionCard
        title={t("customer360.sections.shippingAddresses")}
        items={shippingAddresses}
        colors={colors}
        noDataKey={noDataKey}
        formatDate={formatDateCb}
      />
      <SectionCard
        title={t("customer360.sections.recentDemands")}
        items={recentDemands}
        colors={colors}
        noDataKey={noDataKey}
        formatDate={formatDateCb}
      />
      <SectionCard
        title={t("customer360.sections.recentQuotations")}
        items={recentQuotations}
        colors={colors}
        noDataKey={noDataKey}
        formatDate={formatDateCb}
      />
      <SectionCard
        title={t("customer360.sections.recentOrders")}
        items={recentOrders}
        colors={colors}
        noDataKey={noDataKey}
        formatDate={formatDateCb}
      />
      <SectionCard
        title={t("customer360.sections.recentActivities")}
        items={recentActivities}
        colors={colors}
        noDataKey={noDataKey}
        formatDate={formatDateCb}
      />
      <TimelineSection
        title={t("customer360.sections.timeline")}
        timeline={timeline}
        colors={colors}
        noDataKey={noDataKey}
        formatDateTime={formatDateTimeCb}
        getStatusLabel={getStatusLabel}
        formatAmount={formatAmountCb}
      />
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
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
});
