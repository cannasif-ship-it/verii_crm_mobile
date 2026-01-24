import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useDailyTasks } from "../hooks";
import { TaskCard } from "../components";
import type { ActivityDto } from "../../activity/types";
import type { MarkedDates, CalendarViewProps } from "../types";

LocaleConfig.locales["tr"] = {
  monthNames: [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ],
  monthNamesShort: [
    "Oca", "Şub", "Mar", "Nis", "May", "Haz",
    "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
  ],
  dayNames: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
  dayNamesShort: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  today: "Bugün",
};

LocaleConfig.defaultLocale = "tr";

function getMonthRange(date: Date): { startDate: string; endDate: string } {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return {
    startDate: startOfMonth.toISOString(),
    endDate: endOfMonth.toISOString(),
  };
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function CalendarView({
  selectedDate,
  onDateSelect,
  onAddForDate,
}: CalendarViewProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleAddForSelectedDate = useCallback(() => {
    if (selectedDate) {
      onAddForDate(selectedDate);
    }
  }, [selectedDate, onAddForDate]);

  const monthRange = useMemo(() => getMonthRange(currentMonth), [currentMonth]);
  const { data: tasks, isLoading } = useDailyTasks(monthRange);

  const tasksByDate = useMemo(() => {
    const map: Record<string, ActivityDto[]> = {};
    if (!tasks) return map;

    tasks.forEach((task) => {
      const dateKey = formatDateKey(new Date(task.activityDate));
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(task);
    });

    return map;
  }, [tasks]);

  const markedDates: MarkedDates = useMemo(() => {
    const marks: MarkedDates = {};

    Object.keys(tasksByDate).forEach((dateKey) => {
      marks[dateKey] = {
        marked: true,
        dotColor: "#E84855",
      };
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: "#E84855",
      };
    }

    return marks;
  }, [tasksByDate, selectedDate]);

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasksByDate[selectedDate] || [];
  }, [selectedDate, tasksByDate]);

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      onDateSelect(day.dateString);
    },
    [onDateSelect]
  );

  const handleMonthChange = useCallback((month: { year: number; month: number }) => {
    setCurrentMonth(new Date(month.year, month.month - 1, 1));
  }, []);

  const renderTaskItem = ({ item }: { item: ActivityDto }): React.ReactElement => {
    return <TaskCard task={item} compact />;
  };

  const renderTaskList = (): React.ReactElement => {
    if (!selectedDate) {
      return (
        <View style={styles.hintContainer}>
          <Text style={[styles.hintText, { color: colors.textMuted }]}>
            {t("dailyTasks.selectDateHint")}
          </Text>
        </View>
      );
    }

    const formattedDate = new Date(selectedDate).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (selectedTasks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.dateTitle, { color: colors.text }]}>{formattedDate}</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("dailyTasks.noTasksForDate")}
          </Text>
          <TouchableOpacity
            style={[styles.addForDateButton, { backgroundColor: colors.accent }]}
            onPress={handleAddForSelectedDate}
          >
            <Text style={styles.addForDateButtonIcon}>+</Text>
            <Text style={styles.addForDateButtonText}>{t("dailyTasks.addForDate")}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.taskListContainer}>
        <View style={styles.taskListHeader}>
          <Text style={[styles.taskListTitle, { color: colors.text }]}>{formattedDate}</Text>
          <TouchableOpacity
            style={[styles.addForDateButtonSmall, { backgroundColor: colors.accent }]}
            onPress={handleAddForSelectedDate}
          >
            <Text style={styles.addForDateButtonSmallText}>+</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={selectedTasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTaskItem}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: "transparent",
      calendarBackground: "transparent",
      textSectionTitleColor: colors.textSecondary,
      selectedDayBackgroundColor: "#E84855",
      selectedDayTextColor: "#FFFFFF",
      todayTextColor: "#E84855",
      dayTextColor: colors.text,
      textDisabledColor: colors.textMuted,
      dotColor: "#E84855",
      selectedDotColor: "#FFFFFF",
      arrowColor: "#E84855",
      monthTextColor: colors.text,
      textDayFontWeight: "500" as const,
      textMonthFontWeight: "600" as const,
      textDayHeaderFontWeight: "500" as const,
      textDayFontSize: 15,
      textMonthFontSize: 17,
      textDayHeaderFontSize: 13,
    }),
    [colors, themeMode]
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      )}
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        theme={calendarTheme}
        enableSwipeMonths
        style={styles.calendar}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      {renderTaskList()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    paddingHorizontal: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  hintContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  addForDateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  addForDateButtonIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  addForDateButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  taskListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  taskListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskListTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  addForDateButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addForDateButtonSmallText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: -2,
  },
});
