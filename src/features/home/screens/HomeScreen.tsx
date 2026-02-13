import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useDashboard } from "../hooks/useDashboard";
import { CRM_MODULES } from "../constants/modules";
import type { Module } from "../types";

import { ModuleCard } from "../components/ModuleCard";
import { HomeHero } from "../components/HomeHero";
import { StatsStrip } from "../components/StatsStrip";

export function HomeScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  // Fallback arka plan rengi
  const mainBg = themeMode === "dark" ? "#0c0516" : "#FFFFFF";

  // DÜZELTME: Renkler biraz daha belirginleştirildi.
  const gradientColors = (themeMode === "dark"
    // Dark Mod: Opaklık 0.08'den 0.12'ye çıkarıldı
    ? ['rgba(236, 72, 153, 0.12)', 'transparent', 'rgba(249, 115, 22, 0.12)']
    // Light Mod: Opaklık 0.5'ten 0.8'e çıkarıldı (Mevcut pastel tonlar korundu)
    : ['rgba(255, 235, 240, 0.8)', '#FFFFFF', 'rgba(255, 240, 225, 0.8)']) as [string, string, ...string[]];

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onOpenModule = useCallback(
    (route: string): void => {
      router.push(route as never);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Module }) => <ModuleCard item={item} onPress={onOpenModule} />,
    [onOpenModule]
  );

  if (isLoading && !data) {
    return (
      <View style={[styles.center, { backgroundColor: mainBg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: mainBg }]}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />

      {/* AMBIENT BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
          <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
          />
      </View>

      <FlatList
        data={CRM_MODULES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        refreshing={refreshing}
        onRefresh={() => void onRefresh()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <HomeHero themeMode={themeMode} />
            
            <Text style={[styles.sectionTitle, { color: themeMode === 'dark' ? '#F8FAFC' : '#1E293B' }]}>
              {t("home.overview", "Genel Bakış")}
            </Text>
            
            <StatsStrip 
              todayReceiving={data?.stats.todayReceiving ?? 0}
              todayShipping={data?.stats.todayShipping ?? 0}
              pendingTasks={data?.stats.pendingTasks ?? 0}
            />

            <Text style={[styles.sectionTitle, { color: themeMode === 'dark' ? '#F8FAFC' : '#1E293B', marginTop: 12 }]}>
              {t("home.modules", "Modüller")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.5,
    // fontFamily: "Outfit-Bold", 
  },
  column: {
    gap: 16,
  },
});