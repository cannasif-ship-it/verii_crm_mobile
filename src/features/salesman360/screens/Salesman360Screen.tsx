import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Text } from "../../../components/ui/text";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useAuthStore } from "../../../store/auth";
import {
  useSalesman360Overview,
  useSalesman360AnalyticsSummary,
  useSalesman360AnalyticsCharts,
} from "../hooks";
import { CurrencyPicker } from "../components";
import { Salesman360OverviewTab } from "./Salesman360OverviewTab";
import { Salesman360AnalyticsTab } from "./Salesman360AnalyticsTab";

type TabType = "overview" | "analytics";

function isNotFoundError(error: Error | null): boolean {
  if (!error) return false;
  const err = error as Error & { status?: number };
  const message = error.message?.toLowerCase() ?? "";
  return (
    err.status === 404 ||
    message.includes("not found") ||
    message.includes("bulunamadı")
  );
}

function collectCurrencyOptions(
  overviewCurrencies: { currency: string }[],
  summaryCurrencies: { currency: string }[],
  chartsCurrencies: { currency?: string | null }[]
): string[] {
  const set = new Set<string>();
  overviewCurrencies.forEach((r) => {
    if (r.currency) set.add(r.currency);
  });
  summaryCurrencies.forEach((r) => {
    if (r.currency) set.add(r.currency);
  });
  chartsCurrencies.forEach((r) => {
    if (r.currency) set.add(r.currency);
  });
  return Array.from(set).sort();
}

export function Salesman360Screen(): React.ReactElement {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { colors } = useUIStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("ALL");

  const userId = user?.id;
  const currencyParam = selectedCurrency === "ALL" ? null : selectedCurrency;

  const overviewQuery = useSalesman360Overview(
    userId,
    currencyParam
  );
  const summaryQuery = useSalesman360AnalyticsSummary(
    userId,
    currencyParam
  );
  const chartsQuery = useSalesman360AnalyticsCharts(
    userId,
    12,
    currencyParam
  );

  const invalidUser = userId == null || userId === 0;
  const notFound =
    overviewQuery.isError && isNotFoundError(overviewQuery.error);
  const showNotFound = invalidUser || notFound;

  const currencyOptions = useMemo(() => {
    const overview = overviewQuery.data?.kpis?.totalsByCurrency ?? [];
    const summary = summaryQuery.data?.totalsByCurrency ?? [];
    const charts = chartsQuery.data?.amountComparisonByCurrency ?? [];
    return collectCurrencyOptions(overview, summary, charts);
  }, [
    overviewQuery.data?.kpis?.totalsByCurrency,
    summaryQuery.data?.totalsByCurrency,
    chartsQuery.data?.amountComparisonByCurrency,
  ]);

  const subtitle = overviewQuery.data
    ? [overviewQuery.data.fullName, overviewQuery.data.email].filter(Boolean).join(" · ")
    : "";
  const contentBackground = colors.background;
  const isSingleCurrency = selectedCurrency !== "ALL";

  if (showNotFound) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("salesman360.title")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.centered}>
              <Text style={[styles.notFoundText, { color: colors.text }]}>
                {t("salesman360.notFound")}
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
        <ScreenHeader title={t("salesman360.title")} showBackButton />
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
              label={t("salesman360.currencyFilter.label")}
              allLabel={t("salesman360.currencyFilter.all")}
              colors={colors}
              onSelect={setSelectedCurrency}
            />
          </View>
          <View
            style={[
              styles.tabBar,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
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
                  {
                    color:
                      activeTab === "overview" ? colors.accent : colors.textMuted,
                  },
                ]}
              >
                {t("salesman360.tabs.overview")}
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
                  {
                    color:
                      activeTab === "analytics"
                        ? colors.accent
                        : colors.textMuted,
                  },
                ]}
              >
                {t("salesman360.tabs.analytics")}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "overview" ? (
            overviewQuery.isLoading && !overviewQuery.data ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : overviewQuery.isError ? (
              <View style={styles.errorContainer}>
                <Text
                  style={[styles.errorText, { color: colors.error }]}
                >
                  {overviewQuery.error?.message ?? t("salesman360.error")}
                </Text>
                <TouchableOpacity
                  onPress={() => overviewQuery.refetch()}
                  style={styles.retryButton}
                >
                  <Text style={[styles.retryText, { color: colors.accent }]}>
                    {t("salesman360.retry")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Salesman360OverviewTab
                data={overviewQuery.data}
                colors={colors}
                isSingleCurrency={isSingleCurrency}
              />
            )
          ) : (
            (summaryQuery.isLoading && !summaryQuery.data) ||
            (chartsQuery.isLoading && !chartsQuery.data) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : (
              <Salesman360AnalyticsTab
                summary={summaryQuery.data}
                charts={chartsQuery.data}
                colors={colors}
                isSingleCurrency={isSingleCurrency}
                summaryError={
                  summaryQuery.isError
                    ? summaryQuery.error ?? new Error(t("salesman360.analytics.error"))
                    : null
                }
                chartsError={chartsQuery.isError ? chartsQuery.error ?? null : null}
                isSummaryLoading={summaryQuery.isLoading}
                isChartsLoading={chartsQuery.isLoading}
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
