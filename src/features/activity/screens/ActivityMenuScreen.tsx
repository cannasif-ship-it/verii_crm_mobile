import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { MenuCard } from "../components";

export function ActivityMenuScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const handleActivitiesPress = useCallback(() => {
    router.push("/(tabs)/activities/list");
  }, [router]);

  const handleDailyTasksPress = useCallback(() => {
    router.push("/(tabs)/activities/daily-tasks");
  }, [router]);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader title={t("activityMenu.title")} showBackButton />
        <ScrollView
          style={[styles.content, { backgroundColor: contentBackground }]}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <MenuCard
            title={t("activityMenu.activities")}
            description={t("activityMenu.activitiesDesc")}
            icon="📅"
            onPress={handleActivitiesPress}
          />
          <MenuCard
            title={t("activityMenu.dailyTasks")}
            description={t("activityMenu.dailyTasksDesc")}
            icon="✅"
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 20,
  },
});
