import React, { useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
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

  const menuItems = [
    {
      key: "activities",
      title: t("activityMenu.activities"),
      description: t("activityMenu.activitiesDesc"),
      icon: (
        <Calendar03Icon
          size={24}
          color={THEME_PINK}
          variant="stroke"
          strokeWidth={1.5}
        />
      ),
      onPress: handleActivitiesPress,
    },
    {
      key: "dailyTasks",
      title: t("activityMenu.dailyTasks"),
      description: t("activityMenu.dailyTasksDesc"),
      icon: (
        <TaskDaily01Icon
          size={24}
          color={THEME_PINK}
          variant="stroke"
          strokeWidth={1.5}
        />
      ),
      onPress: handleDailyTasksPress,
    },
  ];

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={headerBg} />
      
      {/* HEADER ALANI */}
      <View style={[styles.container, { backgroundColor: headerBg }]}>
        
        <ScreenHeader title={t("activityMenu.title")} showBackButton />
        
        {/* İÇERİK ALANI (Modern Yuvarlak Köşeler) */}
        <FlatList
          style={[styles.content, { backgroundColor: contentBg }]}
          contentContainerStyle={[
            styles.contentContainer, 
            { paddingBottom: insets.bottom + 100 }
          ]}
          data={menuItems}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <MenuCard
              title={item.title}
              description={item.description}
              icon={item.icon}
              rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
              onPress={item.onPress}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
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
