import React, { useCallback, useMemo, useState, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  Text,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { SearchInput } from "../../customer";
import { useShippingAddresses } from "../hooks";
import { ShippingAddressCard } from "../components";
import type { ShippingAddressDto, PagedFilter } from "../types";
import { ShipmentTrackingIcon } from "hugeicons-react-native";

const PADDING = 16;
const BRAND_COLOR = "#db2777"; 
const BRAND_COLOR_DARK = "#ec4899";

export function ShippingAddressListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  
  const isDark = themeMode === "dark";

  const mainBg = isDark ? "#0c0516" : "#FAFAFA";
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.08)', 'transparent', 'rgba(249, 115, 22, 0.05)'] 
    : ['rgba(219, 39, 119, 0.05)', 'transparent', 'rgba(255, 240, 225, 0.3)']) as [string, string, ...string[]];

  const theme = {
    textMute: isDark ? "#94a3b8" : "#64748B",
    primary: isDark ? BRAND_COLOR_DARK : BRAND_COLOR,     
    surfaceBg: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderColor: isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(219, 39, 119, 0.2)',
    error: "#ef4444",
  };

  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (debouncedQuery.trim().length >= 2) {
      return [{ column: "address", operator: "contains", value: debouncedQuery.trim() }];
    }
    return undefined;
  }, [debouncedQuery]);

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

  const totalCount = data?.pages?.[0]?.totalCount || addresses.length;

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
      return (
        <View style={{ marginBottom: 14 }}>
            <ShippingAddressCard 
                address={item} 
                onPress={() => handleAddressPress(item)} 
            />
        </View>
      );
    },
    [handleAddressPress]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return <View style={{ height: 40 }} />;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }, [isFetchingNextPage, theme.primary]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40, opacity: 0.8 }}>📍</Text>
        <Text style={{ color: theme.textMute, marginTop: 12, fontWeight: '500', letterSpacing: 0.5, textAlign: 'center' }}>
          {t("shippingAddress.noAddresses") || "Kriterlere uygun adres bulunamadı.\nFiltreleri temizlemeyi deneyin."}
        </Text>
      </View>
    );
  }, [isLoading, theme, t]);

  if (isError) {
    return (
        <View style={[styles.container, { backgroundColor: mainBg }]}>
            <ScreenHeader title={t("shippingAddress.title")} showBackButton />
            <View style={styles.center}>
                <Text style={{ color: theme.error, marginBottom: 12 }}>{t("common.error")}</Text>
                <TouchableOpacity 
                    style={[styles.retryButton, { backgroundColor: theme.primary }]} 
                    onPress={() => refetch()}
                >
                    <Text style={{ color: "#FFF", fontWeight: "600" }}>{t("common.retry")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </View>

      <View style={{ flex: 1 }}>
        <ScreenHeader title={t("shippingAddress.title")} showBackButton />

        <View style={styles.contentContainer}>
          
          <View style={styles.controlsArea}>
            <View style={{ flex: 1, marginRight: 10 }}>
               <SearchInput 
                  value={searchText} 
                  onSearch={setSearchText} 
                  placeholder={t("shippingAddress.searchPlaceholder")} 
                />
            </View>
            <TouchableOpacity 
              onPress={handleCreatePress} 
              style={[
                styles.iconBtn, 
                { 
                  backgroundColor: isDark ? "rgba(219, 39, 119, 0.15)" : theme.surfaceBg, 
                  borderColor: isDark ? "rgba(236, 72, 153, 0.3)" : theme.borderColor,
                  shadowOpacity: isDark ? 0 : 0.25,
                  elevation: isDark ? 0 : 3
                }
              ]} 
              activeOpacity={0.7}
            >
              <ShipmentTrackingIcon size={22} color={theme.primary} variant="stroke" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {(!isLoading || data) && (
            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: theme.textMute }]}>
                {totalCount} adres bulundu
              </Text>
            </View>
          )}

          {isLoading && !data ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            <FlatList
              data={addresses}
              keyExtractor={(item, index) => String(item?.id ?? index)}
              renderItem={renderItem}
              contentContainerStyle={{
                  paddingHorizontal: PADDING,
                  paddingTop: 4,
                  paddingBottom: insets.bottom + 100,
              }}
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={handleRefresh}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1 },
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 60 
  },
  
  controlsArea: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 8 
  },
  iconBtn: { 
    height: 50, 
    width: 50, 
    borderRadius: 14, 
    borderWidth: 1.5, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: "#db2777", 
    shadowOffset: { width: 0, height: 0 }, 
    shadowRadius: 10, 
    overflow: 'hidden'
  },

  metaRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 18, 
    paddingBottom: 8 
  },
  metaText: { 
    fontSize: 12, 
    fontWeight: '600', 
    letterSpacing: 0.2 
  },

  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  }
});