import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { CustomRefreshControl } from "../../../components/CustomRefreshControl";
import { useUIStore } from "../../../store/ui";
import { useQuotationList, useCreateRevisionOfQuotation } from "../hooks";
import { QuotationRow } from "../components/QuotationRow";
import { SearchInput } from "../../customer/components";
import type { QuotationGetDto, PagedFilter } from "../types";

export function QuotationListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const [sortBy, setSortBy] = useState<string>("Id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (searchTerm.trim().length >= 2) {
      return [
        { column: "OfferNo", operator: "contains", value: searchTerm.trim() },
        {
          column: "PotentialCustomerName",
          operator: "contains",
          value: searchTerm.trim(),
        },
      ];
    }
    return undefined;
  }, [searchTerm]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuotationList({
    filters,
    sortBy,
    sortDirection,
  });

  const createRevisionMutation = useCreateRevisionOfQuotation();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRowClick = useCallback(
    (id: number) => {
      router.push(`/(tabs)/sales/quotations/${id}`);
    },
    [router]
  );

  const handleRevision = useCallback(
    (e: any, id: number) => {
      e.stopPropagation();
      createRevisionMutation.mutate(id);
    },
    [createRevisionMutation]
  );

  const handleCreatePress = useCallback(() => {
    router.push("/(tabs)/sales/quotations/create");
  }, [router]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const quotations = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page.items ?? [])
        .filter((item): item is QuotationGetDto => item != null) || []
    );
  }, [data]);

  const renderItem = useCallback(
    ({ item }: { item: QuotationGetDto }) => {
      return (
        <QuotationRow
          quotation={item}
          onPress={handleRowClick}
          onRevision={handleRevision}
          isPending={createRevisionMutation.isPending}
        />
      );
    },
    [handleRowClick, handleRevision, createRevisionMutation.isPending]
  );

  const renderEmpty = useCallback(() => {
    if (isLoading || isFetching) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📄</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("quotation.noQuotations")}
        </Text>
      </View>
    );
  }, [isLoading, isFetching, colors, t]);

  const renderHeader = useCallback(() => {
    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("quotation.list")}
          </Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            {t("quotation.listDescription")}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.accent }]}
          onPress={handleCreatePress}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonText}>+ {t("quotation.createNew")}</Text>
        </TouchableOpacity>
      </View>
    );
  }, [colors, t, handleCreatePress]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }, [isFetchingNextPage, colors]);

  if (isLoading && !data) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("quotation.list")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          </View>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("quotation.list")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {t("common.error")}
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: colors.accent }]}
                onPress={() => refetch()}
              >
                <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
              </TouchableOpacity>
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
        <ScreenHeader title={t("quotation.list")} showBackButton />
        <View style={[styles.content, { backgroundColor: contentBackground }]}>
          <View style={styles.searchContainer}>
            <SearchInput
              value={searchTerm}
              onSearch={setSearchTerm}
              placeholder={t("quotation.searchPlaceholder")}
            />
            <TouchableOpacity
              style={[styles.refreshButton, { borderColor: colors.border }]}
              onPress={handleClearSearch}
              activeOpacity={0.7}
            >
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={quotations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <CustomRefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
          />
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingBottom: 0,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshIcon: {
    fontSize: 20,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  header: {
    marginBottom: 20,
  },
  headerContent: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 14,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
