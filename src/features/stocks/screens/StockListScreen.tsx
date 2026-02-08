import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Platform, ScrollView, TouchableOpacity, Text as RNText } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { CustomRefreshControl } from "../../../components/CustomRefreshControl";
import { useUIStore } from "../../../store/ui";
import { useStocks } from "../hooks";
import { SearchInput, StockCard } from "../components";
import type { StockGetDto, PagedFilter } from "../types";

export function StockListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (searchText.trim().length >= 2) {
      return [{ column: "stockName", operator: "contains", value: searchText.trim() }];
    }
    return undefined;
  }, [searchText]);

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useStocks({ filters });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const stocks = useMemo(() => {
    const pages = data?.pages ?? [];
    return pages
      .flatMap((page) => {
        const pageData = page as unknown as { items?: StockGetDto[]; Items?: StockGetDto[] };
        if (Array.isArray(pageData.items)) return pageData.items;
        if (Array.isArray(pageData.Items)) return pageData.Items;
        return [];
      })
      .filter((item): item is StockGetDto => item != null);
  }, [data]);

  const isInitialLoading = isPending && stocks.length === 0;

  const handleStockPress = useCallback(
    (stock: StockGetDto) => {
      if (!stock?.id) return;
      router.push(`/(tabs)/stock/${stock.id}`);
    },
    [router]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderEmpty = useCallback(() => {
    if (isInitialLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t("stock.noStocks")}
        </Text>
      </View>
    );
  }, [isInitialLoading, colors, t]);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}> 
        <ScreenHeader title={t("stock.list")} showBackButton />
        <View style={[styles.content, { backgroundColor: contentBackground }]}> 
          <View style={[styles.searchContainer, { paddingTop: insets.top > 0 ? 0 : 20 }]}> 
            <SearchInput
              value={searchText}
              onSearch={setSearchText}
              placeholder={t("stock.searchPlaceholder")}
            />
          </View>

          {isInitialLoading && !data ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>{t("common.error")}</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                Platform.OS === "android"
                  ? undefined
                  : <CustomRefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
              }
            >
              {stocks.length === 0 ? renderEmpty() : null}
              {stocks.map((item) =>
                Platform.OS === "android" ? (
                  <TouchableOpacity
                    key={String(item.id)}
                    style={styles.androidCard}
                    onPress={() => handleStockPress(item)}
                    activeOpacity={0.8}
                  >
                    <RNText style={styles.androidCardTitle}>{item.stockName || item.erpStockCode}</RNText>
                    <RNText style={styles.androidCardSub}>{item.erpStockCode || "-"}</RNText>
                    <RNText style={styles.androidCardSub}>{item.unit ? `Birim: ${item.unit}` : "Birim: -"}</RNText>
                  </TouchableOpacity>
                ) : (
                  <StockCard key={String(item.id)} stock={item} onPress={() => handleStockPress(item)} />
                )
              )}
              {hasNextPage ? (
                <TouchableOpacity
                  style={[styles.loadMoreButton, { borderColor: colors.cardBorder }]}
                  onPress={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <Text style={{ color: colors.text }}>{t("common.loadMore", "Daha Fazla")}</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </ScrollView>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
  loadMoreButton: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
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
