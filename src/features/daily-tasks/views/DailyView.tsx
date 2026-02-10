import React, { useMemo } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useDailyTasks } from "../hooks";
import { TaskCard } from "../components";
import type { ActivityDto } from "../../activity/types";
import type { DailyViewProps } from "../types";

function getTodayRange(): { startDate: string; endDate: string } {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  };
}

export function DailyView({ onCreateTask: _onCreateTask }: DailyViewProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();

  const todayRange = useMemo(() => getTodayRange(), []);
  const { data: tasks, isLoading, isError, refetch } = useDailyTasks(todayRange);

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      const aDate = a.startDateTime ?? a.activityDate ?? a.createdDate;
      const bDate = b.startDateTime ?? b.activityDate ?? b.createdDate;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });
  }, [tasks]);

  const completedCount = useMemo(() => {
    return sortedTasks.filter((t) => t.isCompleted).length;
  }, [sortedTasks]);

  const renderItem = ({ item }: { item: ActivityDto }): React.ReactElement => {
    return <TaskCard task={item} compact />;
  };

  const renderHeader = (): React.ReactElement => {
    const total = sortedTasks.length;
    if (total === 0) return <View />;

    return (
      <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            {t("dailyTasks.todayProgress")}
          </Text>
          <Text style={[styles.progressCount, { color: colors.textSecondary }]}>
            {completedCount}/{total}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: "#10B981",
                width: `${total > 0 ? (completedCount / total) * 100 : 0}%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderEmpty = (): React.ReactElement => {
    if (isLoading) return <View />;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✨</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("dailyTasks.noDailyTasks")}
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
      data={sortedTasks}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={renderHeader}
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
  progressContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  progressCount: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
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
