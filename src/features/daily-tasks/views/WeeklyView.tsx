import React, { useMemo } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useDailyTasks } from "../hooks";
import { TaskCard } from "../components";
import type { ActivityDto } from "../../activity/types";
import type { WeeklyViewProps } from "../types";

function getWeekRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    startDate: monday.toISOString(),
    endDate: sunday.toISOString(),
  };
}

export function WeeklyView({ onCreateTask: _onCreateTask }: WeeklyViewProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();

  const weekRange = useMemo(() => getWeekRange(), []);
  const { data: tasks, isLoading, isError, refetch } = useDailyTasks(weekRange);

  const renderItem = ({ item }: { item: ActivityDto }): React.ReactElement => {
    return <TaskCard task={item} />;
  };

  const renderEmpty = (): React.ReactElement => {
    if (isLoading) return <View />;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("dailyTasks.noWeeklyTasks")}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>{t("common.error")}</Text>
        <View style={styles.retryButton}>
          <Text style={[styles.retryText, { color: colors.accent }]} onPress={() => refetch()}>
            {t("common.retry")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmpty}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
