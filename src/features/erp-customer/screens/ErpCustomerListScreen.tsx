import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Text as RNText } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { CustomRefreshControl } from "../../../components/CustomRefreshControl";
import { useUIStore } from "../../../store/ui";
import { useErpCustomers } from "../hooks";
import { SearchInput, ErpCustomerCard } from "../components";
import type { CariDto } from "../types";

export function ErpCustomerListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const searchParam = useMemo(() => {
    return searchText.trim().length >= 2 ? searchText.trim() : null;
  }, [searchText]);

  const {
    data: customers = [],
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useErpCustomers(searchParam);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const filteredCustomers = useMemo(() => {
    if (!searchText.trim()) {
      return customers;
    }
    const searchLower = searchText.toLowerCase().trim();
    return customers.filter(
      (customer) =>
        customer.cariKod?.toLowerCase().includes(searchLower) ||
        customer.cariIsim?.toLowerCase().includes(searchLower) ||
        customer.cariTel?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower)
    );
  }, [customers, searchText]);

  const handleCustomerPress = useCallback((customer: CariDto) => {
    console.log("ERP Customer selected:", customer);
  }, []);

  const renderEmpty = useCallback(() => {
    if (isPending) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("erpCustomer.noCustomers")}
        </Text>
      </View>
    );
  }, [isPending, colors, t]);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}> 
        <ScreenHeader title={t("erpCustomer.title")} showBackButton />
        <View style={[styles.content, { backgroundColor: contentBackground }]}> 
          <View style={styles.topSection}>
            <SearchInput
              value={searchText}
              onSearch={setSearchText}
              placeholder={t("erpCustomer.searchPlaceholder")}
            />
          </View>

          {isPending && filteredCustomers.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>{t("common.error")}</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: colors.accent }]}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatListScrollView
              style={styles.list}
              contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                Platform.OS === "android"
                  ? undefined
                  : <CustomRefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
              }
            >
              {filteredCustomers.length === 0 ? renderEmpty() : null}
              {filteredCustomers.map((item, index) =>
                Platform.OS === "android" ? (
                  <TouchableOpacity
                    key={`${item.cariKod}-${item.subeKodu}-${index}`}
                    style={styles.androidCard}
                    onPress={() => handleCustomerPress(item)}
                    activeOpacity={0.8}
                  >
                    <RNText style={styles.androidCardTitle}>{item.cariIsim || item.cariKod}</RNText>
                    <RNText style={styles.androidCardSub}>{item.cariKod}</RNText>
                    <RNText style={styles.androidCardSub}>{item.cariTel || item.email || "-"}</RNText>
                  </TouchableOpacity>
                ) : (
                  <ErpCustomerCard
                    key={`${item.cariKod}-${item.subeKodu}-${index}`}
                    customer={item}
                    onPress={() => handleCustomerPress(item)}
                  />
                )
              )}
            </FlatListScrollView>
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
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  androidCard: {
    backgroundColor: "#1f2937",
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  androidCardTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  androidCardSub: {
    color: "#cbd5e1",
    fontSize: 13,
  },
});
