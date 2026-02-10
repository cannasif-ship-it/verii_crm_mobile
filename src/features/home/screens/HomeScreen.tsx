import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  Calendar03Icon,
  Money03Icon,
  PackageIcon,
  UserGroupIcon,
} from "hugeicons-react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useDashboard } from "../hooks/useDashboard";
import type { Module } from "../types";
import { CRM_MODULES } from "../constants/modules";

type ModuleIcon = React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;

const ICONS: Record<string, ModuleIcon> = {
  customers: UserGroupIcon,
  sales: Money03Icon,
  stock: PackageIcon,
  activities: Calendar03Icon,
};

function ModuleCard({
  item,
  onPress,
}: {
  item: Module;
  onPress: (route: string) => void;
}): React.ReactElement {
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();
  const Icon = ICONS[item.key] ?? PackageIcon;
  const cardBg = themeMode === "dark" ? colors.card : "#FFFFFF";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: colors.border,
          opacity: pressed ? 0.84 : 1,
        },
      ]}
      onPress={() => onPress(item.route)}
    >
      <View style={[styles.iconWrap, { backgroundColor: item.color + "20" }]}>
        <Icon size={22} color={item.color} strokeWidth={2.2} />
      </View>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{t(`modules.${item.key}`)}</Text>
      <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{t(`modules.${item.key}Desc`)}</Text>
    </Pressable>
  );
}

export function HomeScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.centerText, { color: colors.textMuted }]}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}> 
        <Text style={[styles.centerText, { color: colors.text }]}>{t("common.error")}</Text>
        <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
          <Text style={styles.retryText}>{t("common.retry")}</Text>
        </Pressable>
      </View>
    );
  }

  const headlineColor = themeMode === "dark" ? "#f8fafc" : "#0f172a";
  const heroBg = themeMode === "dark" ? "#1f1530" : "#f8fafc";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <FlatList
        data={CRM_MODULES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        refreshing={refreshing}
        onRefresh={() => void onRefresh()}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 96,
        }}
        ListHeaderComponent={
          <View style={[styles.hero, { backgroundColor: heroBg, borderColor: colors.border }]}> 
            <Text style={[styles.heroTitle, { color: headlineColor }]}>{t("home.greeting")}</Text>
            <Text style={[styles.heroSub, { color: colors.textMuted }]}>{t("home.tagline")}</Text>
            <View style={styles.kpiRow}>
              <View style={styles.kpiBlock}>
                <Text style={[styles.kpiValue, { color: colors.text }]}>{String(data?.stats.pendingTasks ?? 0)}</Text>
                <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{t("home.pendingTasks")}</Text>
              </View>
              <View style={[styles.kpiDivider, { backgroundColor: colors.border }]} />
              <View style={styles.kpiBlock}>
                <Text style={[styles.kpiValue, { color: colors.text }]}>{String(data?.stats.todayShipping ?? 0)}</Text>
                <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{t("home.todayShipping")}</Text>
              </View>
              <View style={[styles.kpiDivider, { backgroundColor: colors.border }]} />
              <View style={styles.kpiBlock}>
                <Text style={[styles.kpiValue, { color: colors.text }]}>{String(data?.stats.todayReceiving ?? 0)}</Text>
                <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{t("home.todayReceiving")}</Text>
              </View>
            </View>
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
    paddingHorizontal: 24,
  },
  centerText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
  },
  retryText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  heroSub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  kpiRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  kpiBlock: {
    flex: 1,
    alignItems: "center",
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  kpiLabel: {
    marginTop: 4,
    fontSize: 11,
  },
  kpiDivider: {
    width: 1,
    height: 34,
    opacity: 0.7,
  },
  column: {
    gap: 12,
  },
  card: {
    flex: 1,
    minHeight: 156,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardDesc: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
  },
});
