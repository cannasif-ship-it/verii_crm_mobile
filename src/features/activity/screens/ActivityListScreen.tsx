import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { CustomRefreshControl } from "../../../components/CustomRefreshControl";
import { useUIStore } from "../../../store/ui";
import { useActivities } from "../hooks";
import { SearchInput, ActivityCard } from "../components";
import type { ActivityDto, PagedFilter } from "../types";

export function ActivityListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (searchText.trim().length >= 2) {
      return [{ column: "subject", operator: "contains", value: searchText.trim() }];
    }
    return undefined;
  }, [searchText]);

  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useActivities({ filters });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const activities = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page.items ?? [])
        .filter((item): item is ActivityDto => item != null) || []
    );
  }, [data]);

  const handleActivityPress = useCallback(
    (activity: ActivityDto) => {
      if (!activity?.id) return;
      router.push(`/(tabs)/activities/${activity.id}`);
    },
    [router]
  );

  const handleCreatePress = useCallback(() => {
    router.push("/(tabs)/activities/create");
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: ActivityDto }) => {
      if (!item) return null;
      return <ActivityCard activity={item} onPress={() => handleActivityPress(item)} />;
    },
    [handleActivityPress]
  );

  const renderFooter = useCallback(() => {
    if (!hasNextPage && !isFetchingNextPage) {
      return <View style={styles.footerSpacer} />;
    }

    return (
      <TouchableOpacity
        onPress={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        style={styles.loadMoreButton}
      >
        {isFetchingNextPage ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <Text style={[styles.loadMoreText, { color: colors.accent }]}>{t("common.loadMore")}</Text>
        )}
      </TouchableOpacity>
    );
  }, [colors.accent, fetchNextPage, hasNextPage, isFetchingNextPage, t]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t("activity.noActivities")}</Text>
      </View>
    );
  }, [isLoading, colors.textMuted, t]);

  const keyExtractor = useCallback((item: ActivityDto, index: number) => String(item?.id ?? index), []);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={t("activity.title")}
          showBackButton
          rightContent={
            <TouchableOpacity onPress={handleCreatePress} style={styles.addButton}>
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          }
        />
        <View style={[styles.content, { backgroundColor: contentBackground }]}>
          <View style={styles.topSection}>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.accent }]}
              onPress={handleCreatePress}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonIcon}>+</Text>
              <Text style={styles.createButtonText}>{t("activity.create")}</Text>
            </TouchableOpacity>
            <SearchInput
              value={searchText}
              onSearch={setSearchText}
              placeholder={t("activity.searchPlaceholder")}
            />
          </View>

          {isLoading && activities.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error?.message || t("common.error")}</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: colors.accent }]}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={activities}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
              refreshControl={
                <CustomRefreshControl
                  refreshing={isRefetching && !isFetchingNextPage}
                  onRefresh={handleRefresh}
                />
              }
            />
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
    gap: 12,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  createButtonIcon: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  createButtonText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
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
    fontSize: 14,
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
  loadMoreButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footerSpacer: {
    height: 36,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
