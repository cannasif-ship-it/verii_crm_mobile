import React from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../../locales";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Text } from "../../components/ui/text";
import { CustomRefreshControl } from "../../components/CustomRefreshControl";
import { useUIStore } from "../../store/ui";
import {
  ModuleCard,
  ActivityItem,
  HomeHero,
  StatsStrip,
  useDashboard,
  CRM_MODULES,
} from "../../features/home";

const CONTENT_PX = 20;
const SECTION_TOP = 24;
const SECTION_TITLE_SIZE = 20;

export default function HomeScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useUIStore();
  const { data, isLoading, refetch } = useDashboard();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleModulePress = (route: string): void => {
    router.push(route as never);
  };

  const handleViewAllPress = (): void => {
    router.push("/(tabs)/activities/list" as never);
  };

  if (isLoading && !data) {
    return (
      <View style={[styles.loadingRoot, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  const contentPaddingBottom = insets.bottom + 100;

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView
          style={[styles.scroll, { backgroundColor: colors.background }]}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: contentPaddingBottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <CustomRefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <HomeHero />

          {data?.stats != null && (
            <StatsStrip
              todayReceiving={data.stats.todayReceiving}
              todayShipping={data.stats.todayShipping}
              pendingTasks={data.stats.pendingTasks}
            />
          )}

          <View className="mb-8">
            <Text
              className="text-app-text dark:text-app-textDark mb-1 font-bold"
              style={{ fontSize: SECTION_TITLE_SIZE }}
            >
              {t("home.modules")}
            </Text>
            <Text className="text-[13px] text-app-textSecondary dark:text-app-textSecondaryDark mb-4">
              {t("home.quickAccess")}
            </Text>
            <View>
              {CRM_MODULES.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onPress={handleModulePress}
                  isPrimary={index === 0}
                />
              ))}
            </View>
          </View>

          <View>
            <View className="flex-row justify-between items-baseline mb-4">
              <Text
                className="text-app-text dark:text-app-textDark font-bold"
                style={{ fontSize: SECTION_TITLE_SIZE }}
              >
                {t("home.recentActivity")}
              </Text>
              <Pressable
                onPress={handleViewAllPress}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="py-2 px-1"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="text-[13px] font-semibold text-app-accent">
                  {t("home.viewAll")}
                </Text>
              </Pressable>
            </View>

            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} item={activity} />
              ))
            ) : (
              <View className="py-12 px-6 rounded-2xl border border-app-cardBorder dark:border-app-cardBorderDark bg-app-card dark:bg-app-cardDark items-center justify-center">
                <View className="w-14 h-14 rounded-full bg-app-backgroundSecondary dark:bg-white/5 items-center justify-center mb-4">
                  <Text className="text-3xl">📋</Text>
                </View>
                <Text className="text-sm text-app-textMuted dark:text-app-textMutedDark text-center max-w-[220px] leading-5">
                  {t("home.noActivity")}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  scrollContent: {
    paddingTop: SECTION_TOP,
    paddingHorizontal: CONTENT_PX,
  },
  loadingRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
});
