import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Text } from "../../../components/ui/text";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import {
  useCustomer360Overview,
  useCustomer360AnalyticsSummary,
  useCustomer360AnalyticsCharts,
} from "../hooks";
import { CurrencyPicker } from "../components";
import { Customer360OverviewTab } from "./Customer360OverviewTab";
import { Customer360AnalyticsTab } from "./Customer360AnalyticsTab";

type TabType = "overview" | "analytics";

function collectCurrencyOptions(
  summaryCurrencies: { currency: string }[],
  chartsCurrencies: { currency?: string | null }[]
): string[] {
  const set = new Set<string>();
  summaryCurrencies.forEach((r) => {
    if (r.currency) set.add(r.currency);
  });
  chartsCurrencies.forEach((r) => {
    if (r.currency) set.add(r.currency);
  });
  return Array.from(set).sort();
}

function isNotFoundError(error: Error | null): boolean {
  if (!error) return false;
  const msg = (error as Error & { status?: number }).status;
  const message = error.message?.toLowerCase() ?? "";
  return msg === 404 || message.includes("not found") || message.includes("bulunamadı");
}

export function Customer360Screen(): React.ReactElement {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useUIStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("ALL");

  const customerId = useMemo(() => {
    if (id == null || id === "") return undefined;
    const num = Number(id);
    return Number.isFinite(num) && num > 0 ? num : undefined;
  }, [id]);

  const currencyParam = selectedCurrency === "ALL" ? null : selectedCurrency;
  const overviewQuery = useCustomer360Overview(customerId, currencyParam);
  const summaryQuery = useCustomer360AnalyticsSummary(customerId, currencyParam);
  const chartsQuery = useCustomer360AnalyticsCharts(customerId, 12, currencyParam);

  const currencyOptions = useMemo(() => {
    const summary = summaryQuery.data?.totalsByCurrency ?? [];
    const charts = chartsQuery.data?.amountComparisonByCurrency ?? [];
    return collectCurrencyOptions(summary, charts);
  }, [
    summaryQuery.data?.totalsByCurrency,
    chartsQuery.data?.amountComparisonByCurrency,
  ]);
  const isSingleCurrency = selectedCurrency !== "ALL";

  const invalidId = customerId == null;
  const notFound = overviewQuery.isError && isNotFoundError(overviewQuery.error);
  const showNotFound = invalidId || notFound;

  const profile = overviewQuery.data?.profile;
  const subtitle = profile
    ? [profile.name, profile.customerCode].filter(Boolean).join(" · ")
    : "";

  const contentBackground = colors.background;

  if (showNotFound) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("customer360.title")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.centered}>
              <Text style={[styles.notFoundText, { color: colors.text }]}>
                {t("customer360.notFound")}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={t("customer360.title")}
          showBackButton
        />
        <View style={[styles.content, { backgroundColor: contentBackground }]}>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
          ) : null}
          <View style={styles.currencySection}>
            <CurrencyPicker
              selectedCurrency={selectedCurrency}
              currencyOptions={currencyOptions}
              label={t("customer360.currencyFilter.label")}
              allLabel={t("customer360.currencyFilter.all")}
              colors={colors}
              onSelect={setSelectedCurrency}
            />
          </View>
          <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "overview" && {
                  borderBottomColor: colors.accent,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab("overview")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === "overview" ? colors.accent : colors.textMuted },
                ]}
              >
                {t("customer360.tabs.overview")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "analytics" && {
                  borderBottomColor: colors.accent,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab("analytics")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === "analytics" ? colors.accent : colors.textMuted },
                ]}
              >
                {t("customer360.tabs.analytics")}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "overview" ? (
            overviewQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : overviewQuery.isError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {overviewQuery.error?.message ?? t("customer360.error")}
                </Text>
                <TouchableOpacity
                  onPress={() => overviewQuery.refetch()}
                  style={styles.retryButton}
                >
                  <Text style={[styles.retryText, { color: colors.accent }]}>
                    {t("customer360.retry")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Customer360OverviewTab
                data={overviewQuery.data}
                colors={colors}
                isFetching={overviewQuery.isFetching}
              />
            )
          ) : (
            summaryQuery.isLoading && !summaryQuery.data ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : (
              <Customer360AnalyticsTab
                summary={summaryQuery.data}
                charts={chartsQuery.data}
                colors={colors}
                isSingleCurrency={isSingleCurrency}
                isSummaryLoading={summaryQuery.isLoading}
                isChartsLoading={chartsQuery.isLoading}
                summaryError={summaryQuery.isError ? summaryQuery.error ?? new Error(t("customer360.analytics.error")) : null}
                chartsError={chartsQuery.isError ? chartsQuery.error ?? null : null}
              />
            )
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  currencySection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    textAlign: "center",
  },
});
