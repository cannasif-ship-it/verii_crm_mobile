import React, { useMemo, useCallback } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useDailyTasks } from "../hooks";
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

const WEEKLY_HOURS: number[] = Array.from({ length: 12 }, (_, index) => index + 8);

function getWeekDays(startDateIso: string): Date[] {
  const startDate = new Date(startDateIso);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + index);
    day.setHours(0, 0, 0, 0);
    return day;
  });
}

function getSlotRange(day: Date, hour: number): { start: string; end: string } {
  const start = new Date(day);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(day);
  end.setHours(hour + 1, 0, 0, 0);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function getActivitiesForSlot(tasks: ActivityDto[], day: Date, hour: number): ActivityDto[] {
  const slotStart = new Date(day);
  slotStart.setHours(hour, 0, 0, 0);
  const slotEnd = new Date(day);
  slotEnd.setHours(hour + 1, 0, 0, 0);
  const slotStartMs = slotStart.getTime();
  const slotEndMs = slotEnd.getTime();

  return tasks.filter((activity) => {
    const startDateValue = activity.startDateTime ?? activity.activityDate;
    if (!startDateValue) return false;
    const startMs = new Date(startDateValue).getTime();
    const endMs = activity.endDateTime ? new Date(activity.endDateTime).getTime() : startMs;
    return startMs < slotEndMs && endMs > slotStartMs;
  });
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatDayLabel(day: Date): string {
  return day.toLocaleDateString("tr-TR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

export function WeeklyView({ onCreateTask }: WeeklyViewProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();

  const weekRange = useMemo(() => getWeekRange(), []);
  const { data: tasks, isLoading, isError, refetch } = useDailyTasks(weekRange);
  const weekDays = useMemo(() => getWeekDays(weekRange.startDate), [weekRange.startDate]);

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

  const safeTasks = tasks ?? [];

  const renderDayColumn = useCallback(
    (day: Date): React.ReactElement => (
      <View key={day.toISOString()} style={styles.dayColumn}>
        <Text style={[styles.dayHeader, { color: colors.textSecondary }]}>
          {formatDayLabel(day)}
        </Text>
        {WEEKLY_HOURS.map((hour) => {
          const slotActivities = getActivitiesForSlot(safeTasks, day, hour);
          const hasItems = slotActivities.length > 0;
          const range = getSlotRange(day, hour);
          return (
            <TouchableOpacity
              key={`${day.toISOString()}-${hour}`}
              style={[
                styles.slotCell,
                { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                hasItems && { borderColor: colors.accent, backgroundColor: colors.activeBackground },
              ]}
              onPress={() => onCreateTask(range.start, range.end)}
              activeOpacity={0.75}
            >
              {hasItems ? (
                <Text style={[styles.slotCount, { color: colors.accent }]}>+{slotActivities.length}</Text>
              ) : (
                <Text style={[styles.slotHint, { color: colors.textMuted }]}>+</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ),
    [colors, safeTasks, onCreateTask]
  );

  return (
    <FlatList
      data={[0]}
      keyExtractor={(item) => String(item)}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmpty}
      renderItem={() => (
        <View style={styles.gridContainer}>
          <View style={styles.hourColumn}>
            <Text style={[styles.dayHeader, { color: colors.textSecondary }]}>
              {t("dailyTasks.weekly")}
            </Text>
            {WEEKLY_HOURS.map((hour) => (
              <View key={`h-${hour}`} style={styles.hourCell}>
                <Text style={[styles.hourLabel, { color: colors.textMuted }]}>{formatHour(hour)}</Text>
              </View>
            ))}
          </View>
          <FlatList
            horizontal
            data={weekDays}
            keyExtractor={(day) => day.toISOString()}
            renderItem={({ item }) => renderDayColumn(item)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysListContent}
          />
        </View>
      )}
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
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: "row",
  },
  hourColumn: {
    width: 64,
    marginRight: 8,
  },
  daysListContent: {
    paddingRight: 12,
  },
  dayColumn: {
    width: 86,
    marginRight: 6,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    minHeight: 18,
  },
  hourCell: {
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  hourLabel: {
    fontSize: 11,
  },
  slotCell: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  slotHint: {
    fontSize: 16,
    fontWeight: "500",
  },
  slotCount: {
    fontSize: 12,
    fontWeight: "700",
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
