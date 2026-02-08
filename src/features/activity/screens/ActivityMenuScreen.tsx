import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { MenuCard } from "../components"; // Yeni Pembe MenuCard

// --- PROFESYONEL İKONLAR ---
import { 
  Calendar03Icon,    // Aktiviteler / Takvim
  TaskDaily01Icon,   // Günlük İşler
  ArrowRight01Icon 
} from "hugeicons-react-native";

export function ActivityMenuScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Store Verileri
  const { colors, themeMode } = useUIStore() as any;
  const insets = useSafeAreaInsets();
  const isDark = themeMode === "dark";

  // --- TEMA RENKLERİ ---
  const THEME_PINK = "#ec4899"; // Neon Pembe
  const headerBg = isDark ? (colors?.header || "#1E293B") : "#FFFFFF";
  const contentBg = isDark ? (colors?.background || "#0f0518") : "#F8F9FA";
  const arrowColor = isDark ? "#64748B" : "#9CA3AF";

  // --- YÖNLENDİRMELER ---
  const handleActivitiesPress = useCallback(() => {
    router.push("/(tabs)/activities/list");
  }, [router]);

  const handleDailyTasksPress = useCallback(() => {
    router.push("/(tabs)/activities/daily-tasks");
  }, [router]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={headerBg} />
      
      {/* HEADER ALANI */}
      <View style={[styles.container, { backgroundColor: headerBg }]}>
        
        <ScreenHeader title={t("activityMenu.title", "Aktivite Yönetimi")} showBackButton />
        
        {/* İÇERİK ALANI (Modern Yuvarlak Köşeler) */}
        <ScrollView
          style={[styles.content, { backgroundColor: contentBg }]}
          contentContainerStyle={[
            styles.contentContainer, 
            { paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. AKTİVİTELER */}
          <MenuCard
            title={t("activityMenu.activities", "Aktiviteler")}
            description={t("activityMenu.activitiesDesc", "Toplantı, ziyaret ve aramalarınızı yönetin")}
            icon={
              <Calendar03Icon 
                size={24} 
                color={THEME_PINK} 
                variant="stroke" 
                strokeWidth={1.5}
              />
            }
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleActivitiesPress}
          />

          {/* 2. GÜNLÜK İŞLER */}
          <MenuCard
            title={t("activityMenu.dailyTasks", "Günlük İşler")}
            description={t("activityMenu.dailyTasksDesc", "Günlük görevlerinizi takip edin")}
            icon={
              <TaskDaily01Icon 
                size={24} 
                color={THEME_PINK} 
                variant="stroke" 
                strokeWidth={1.5}
              />
            }
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleDailyTasksPress}
          />

        </ScrollView>
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
    // Modern Bottom Sheet Görünümü (32px radius)
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    // Hafif üst çizgi
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 32,
  },
});