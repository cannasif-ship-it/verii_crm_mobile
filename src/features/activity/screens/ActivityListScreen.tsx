import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Text
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useActivities } from "../hooks";
import { SearchInput, ActivityCard } from "../components";
import type { ActivityDto, PagedFilter } from "../types";
// İkon (Tasarım bütünlüğü için)
import { Add01Icon } from "hugeicons-react-native";

const GAP = 12;
const PADDING = 16;

export function ActivityListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  
  const isDark = themeMode === "dark";

  // --- TEMA AYARLARI ---
  const theme = {
    screenBg: isDark ? "#1a0b2e" : "#F8FAFC",
    headerBg: isDark ? "#1a0b2e" : "#FFFFFF",
    cardBg: isDark ? "#1e1b29" : "#FFFFFF",
    cardBorder: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
    textTitle: isDark ? "#FFFFFF" : "#0F172A",
    textMute: isDark ? "#94a3b8" : "#64748B",
    primary: "#db2777",
    primaryBg: isDark ? "rgba(219, 39, 119, 0.15)" : "rgba(219, 39, 119, 0.1)",
    activeSwitch: "#db2777",
    error: "#ef4444",
  };

  const [searchText, setSearchText] = useState("");
  // Performans için debounce
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (debouncedQuery.trim().length >= 2) {
      return [{ column: "subject", operator: "contains", value: debouncedQuery.trim() }];
    }
    return undefined;
  }, [debouncedQuery]);

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

  // Veri Düzleştirme
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

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- RENDER ITEMS ---

  const renderItem = useCallback(
    ({ item }: { item: ActivityDto }) => {
      if (!item) return null;
      return (
        // Wrapper: Tema uyumu için çerçeve
        <View style={[
            styles.cardWrapper, 
            { 
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder
            }
        ]}>
             <ActivityCard 
                activity={item} 
                onPress={() => handleActivityPress(item)} 
             />
        </View>
      );
    },
    [handleActivityPress, theme]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return <View style={{ height: 40 }} />;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }, [isFetchingNextPage, theme]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📅</Text>
        <Text style={{ color: theme.textMute, fontSize: 16 }}>
          {t("activity.noActivities")}
        </Text>
      </View>
    );
  }, [isLoading, theme, t]);

  // --- ERROR STATE ---
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.headerBg} />
        <ScreenHeader title={t("activity.title")} showBackButton />
        <View style={styles.center}>
            <Text style={{ color: theme.error, marginBottom: 12, textAlign: 'center' }}>
                {error?.message || t("common.error")}
            </Text>
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

  // --- MAIN RENDER ---
  return (
    <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.headerBg} />
      
      <ScreenHeader title={t("activity.title")} showBackButton />

      <View style={styles.listContainer}>
        
        {/* CONTROLS AREA (Header Altı) */}
        <View style={[styles.controlsArea, { backgroundColor: theme.headerBg }]}>
             {/* Arama Inputu */}
             <View style={{ flex: 1, marginRight: 10 }}>
                <SearchInput
                    value={searchText}
                    onSearch={setSearchText}
                    placeholder={t("activity.searchPlaceholder")}
                />
             </View>

             {/* Yeni Ekle Butonu */}
             <View style={[styles.actionBtnContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                <TouchableWithoutFeedback onPress={handleCreatePress}>
                    <View style={[styles.iconBtn, { backgroundColor: theme.activeSwitch }]}>
                         <Add01Icon size={20} color="#FFF" variant="stroke" />
                    </View>
                </TouchableWithoutFeedback>
             </View>
        </View>

        {/* LOADING & LIST */}
        {isLoading && activities.length === 0 ? (
           <View style={styles.center}>
             <ActivityIndicator size="large" color={theme.primary} />
           </View>
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            renderItem={renderItem}
            contentContainerStyle={{
                paddingHorizontal: PADDING,
                paddingTop: 12,
                paddingBottom: insets.bottom + 20,
                gap: GAP, 
            }}
            showsVerticalScrollIndicator={false}
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1 },
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 50 
  },
  // Controls Area
  controlsArea: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
  },
  actionBtnContainer: {
    flexDirection: 'row', 
    padding: 4, 
    borderRadius: 12, 
    alignItems: 'center', 
    height: 48,
    width: 48, 
    justifyContent: 'center'
  },
  iconBtn: { 
    padding: 8, 
    borderRadius: 8, 
    height: 40, 
    width: 40, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  // Kart Stili
  cardWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  }
});