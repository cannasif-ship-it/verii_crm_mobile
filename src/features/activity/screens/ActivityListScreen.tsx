import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useActivities } from "../hooks";
import { SearchInput, ActivityCard } from "../components";
import type { ActivityDto, PagedFilter } from "../types";
import { CalendarAdd01Icon } from "hugeicons-react-native";

const GAP = 12;
const PADDING = 16;
const BRAND_COLOR = "#db2777"; 
const BRAND_COLOR_DARK = "#ec4899";

export function ActivityListScreen(): React.ReactElement {
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
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(219, 39, 119, 0.2)',
  };

  const [searchText, setSearchText] = useState("");
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
  } = useActivities({ filters, pageSize: 20 });

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

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

 
  const renderItem = useCallback(
    ({ item }: { item: ActivityDto }) => {
      if (!item) return null;
      return (
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

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: mainBg }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={StyleSheet.absoluteFill}>
           <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </View>
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

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </View>

      <ScreenHeader title={t("activity.title")} showBackButton />

      <View style={styles.listContainer}>
        
        {/* CONTROLS AREA */}
        <View style={styles.controlsArea}>
             <View style={{ flex: 1, marginRight: 10 }}>
                <SearchInput
                    value={searchText}
                    onSearch={setSearchText}
                    placeholder={t("activity.searchPlaceholder")}
                />
             </View>

             <TouchableOpacity 
                onPress={handleCreatePress} 
                style={styles.iconBtn} 
                activeOpacity={0.7}
             >
               <CalendarAdd01Icon size={24} color="#FFF" variant="stroke" strokeWidth={2.5} />
             </TouchableOpacity>
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
              
                paddingBottom: insets.bottom + 40, 
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
    borderRadius: 16, 
    backgroundColor: BRAND_COLOR, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: BRAND_COLOR, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 8, 
    elevation: 6 
  },
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