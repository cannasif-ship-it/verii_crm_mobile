import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Text as RNText } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
  
  const isDark = themeMode === "dark";

  // 1. Ana zemin ve Gradient Renkleri (Standart Şablon)
  const mainBg = isDark ? "#0c0516" : "#FFFFFF";
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.12)', 'transparent', 'rgba(249, 115, 22, 0.12)'] 
    : ['rgba(255, 235, 240, 0.6)', '#FFFFFF', 'rgba(255, 240, 225, 0.6)']) as [string, string, ...string[]];

  const [searchText, setSearchText] = useState("");

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
  }, [isPending, colors.accent, colors.textMuted, t]);

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      {/* StatusBar ayarı */}
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* KATMAN 1: Ambient Gradient (En arkada) */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* KATMAN 2: Sayfa İçeriği */}
      <View style={{ flex: 1 }}>
        <ScreenHeader title={t("erpCustomer.title")} showBackButton />
        
        <View style={styles.content}>
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
                    style={[
                      styles.androidCard, 
                      { 
                        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" 
                      }
                    ]}
                    onPress={() => handleCustomerPress(item)}
                    activeOpacity={0.8}
                  >
                    <RNText style={[styles.androidCardTitle, { color: colors.text }]}>
                      {item.cariIsim || item.cariKod}
                    </RNText>
                    <RNText style={[styles.androidCardSub, { color: colors.textMuted }]}>
                      {item.cariKod}
                    </RNText>
                    <RNText style={[styles.androidCardSub, { color: colors.textMuted }]}>
                      {item.cariTel || item.email || "-"}
                    </RNText>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent', // Gradientin görünmesi için şeffaf
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    // Glassmorphism etkisi
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  androidCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  androidCardSub: {
    fontSize: 13,
    marginTop: 2,
  },
});