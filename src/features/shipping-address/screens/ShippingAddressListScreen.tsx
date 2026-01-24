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
import { SearchInput } from "../../customer";
import { useShippingAddresses } from "../hooks";
import { ShippingAddressCard } from "../components";
import type { ShippingAddressDto, PagedFilter } from "../types";

export function ShippingAddressListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (searchText.trim().length >= 2) {
      return [{ column: "address", operator: "contains", value: searchText.trim() }];
    }
    return undefined;
  }, [searchText]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useShippingAddresses({ filters });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const addresses = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page.items ?? [])
        .filter((item): item is ShippingAddressDto => item != null) || []
    );
  }, [data]);

  const handleAddressPress = useCallback(
    (address: ShippingAddressDto) => {
      if (!address?.id) return;
      router.push(`/(tabs)/customers/shipping/${address.id}`);
    },
    [router]
  );

  const handleCreatePress = useCallback(() => {
    router.push("/(tabs)/customers/shipping/create");
  }, [router]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: ShippingAddressDto }) => {
      if (!item) return null;
      return <ShippingAddressCard address={item} onPress={() => handleAddressPress(item)} />;
    },
    [handleAddressPress]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }, [isFetchingNextPage, colors]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("shippingAddress.noAddresses")}
        </Text>
      </View>
    );
  }, [isLoading, colors, t]);

  const keyExtractor = useCallback((item: ShippingAddressDto, index: number) => String(item?.id ?? index), []);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={t("shippingAddress.title")}
          showBackButton
          rightElement={
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
              <Text style={styles.createButtonText}>{t("shippingAddress.create")}</Text>
            </TouchableOpacity>
            <SearchInput
              value={searchText}
              onSearch={setSearchText}
              placeholder={t("shippingAddress.searchPlaceholder")}
            />
          </View>

          {isLoading && addresses.length === 0 ? (
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
            <FlatList
              data={addresses}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: insets.bottom + 100 },
              ]}
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
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
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
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
    marginTop: -2,
  },
});
