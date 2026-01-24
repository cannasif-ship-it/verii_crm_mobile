import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Text } from "../../components/ui/text";
import { CustomRefreshControl } from "../../components/CustomRefreshControl";
import { useUIStore } from "../../store/ui";
import {
  Header,
  ModuleCard,
  ActivityItem,
  useDashboard,
  CRM_MODULES,
} from "../../features/home";

export default function HomeScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch } = useDashboard();
  const [refreshing, setRefreshing] = React.useState(false);
  const { colors, themeMode } = useUIStore();

  const onRefresh = React.useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleModulePress = (route: string): void => {
    router.push(route as never);
  };

  const handleSettingsPress = (): void => {
    router.push("/(tabs)/settings" as never);
  };

  if (isLoading && !data) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header, paddingTop: insets.top }]}>
        <Header user={data?.user} onSettingsPress={handleSettingsPress} />

        <ScrollView
          style={[styles.content, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <CustomRefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("home.modules")}
            </Text>
            <View style={styles.modulesGrid}>
              {CRM_MODULES.map((module) => (
                <View key={module.id} style={styles.moduleWrapper}>
                  <ModuleCard module={module} onPress={handleModulePress} />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("home.recentActivity")}
              </Text>
              <Text style={[styles.viewAll, { color: colors.accent }]}>
                {t("home.viewAll")}
              </Text>
            </View>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} item={activity} />
              ))
            ) : (
              <View
                style={[
                  styles.emptyActivity,
                  {
                    backgroundColor: themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : "#FFFFFF",
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  {t("home.noActivity")}
                </Text>
              </View>
            )}
          </View>

          <View style={{ height: insets.bottom + 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    paddingTop: 24,
    paddingHorizontal: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  moduleWrapper: {
    width: "50%",
  },
  emptyActivity: {
    padding: 32,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
  },
});
