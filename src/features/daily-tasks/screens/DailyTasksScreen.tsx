import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useToastStore } from "../../../store/toast";
import { useAuthStore } from "../../../store/auth";
import { WeeklyView, DailyView, CalendarView } from "../views";
import { useCreateActivity } from "../../activity/hooks";
import { useActivityTypes } from "../../activity/hooks";
import { buildCreateActivityPayload } from "../../activity/utils/buildCreateActivityPayload";
import type { ViewMode } from "../types";

const TAB_ITEMS: { key: ViewMode; labelKey: string }[] = [
  { key: "weekly", labelKey: "dailyTasks.weekly" },
  { key: "daily", labelKey: "dailyTasks.daily" },
  { key: "calendar", labelKey: "dailyTasks.calendar" },
];

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function DailyTasksScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const showToast = useToastStore((state) => state.showToast);

  const [activeTab, setActiveTab] = useState<ViewMode>("daily");
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);
  const [quickAddSubject, setQuickAddSubject] = useState("");

  const user = useAuthStore((state) => state.user);
  const { data: activityTypes } = useActivityTypes();
  const createActivity = useCreateActivity();

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const todayDateString = useMemo(() => formatDateKey(new Date()), []);

  const getInitialDateForCreate = useCallback((): string => {
    if (activeTab === "calendar" && calendarSelectedDate) {
      const selectedDate = new Date(calendarSelectedDate);
      selectedDate.setHours(9, 0, 0, 0);
      return selectedDate.toISOString();
    }
    return new Date().toISOString();
  }, [activeTab, calendarSelectedDate]);

  const handleCreateTask = useCallback(() => {
    const initialDate = getInitialDateForCreate();
    router.push({
      pathname: "/(tabs)/activities/create",
      params: { initialDate },
    });
  }, [router, getInitialDateForCreate]);

  const handleCreateTaskWithDate = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      date.setHours(9, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(10, 0, 0, 0);
      router.push({
        pathname: "/(tabs)/activities/create",
        params: {
          initialDate: date.toISOString(),
          initialStartDateTime: date.toISOString(),
          initialEndDateTime: endDate.toISOString(),
        },
      });
    },
    [router]
  );

  const handleCreateTaskForSlot = useCallback(
    (startDateTime: string, endDateTime: string) => {
      router.push({
        pathname: "/(tabs)/activities/create",
        params: {
          initialDate: startDateTime,
          initialStartDateTime: startDateTime,
          initialEndDateTime: endDateTime,
        },
      });
    },
    [router]
  );

  const handleQuickAdd = useCallback(async () => {
    if (!quickAddSubject.trim()) return;

    Keyboard.dismiss();

    try {
      const payload = buildCreateActivityPayload(
        {
          subject: quickAddSubject.trim(),
          activityType: "Görev",
          status: "Scheduled",
          isCompleted: false,
          activityDate: new Date().toISOString(),
        },
        { activityTypes: activityTypes ?? [], assignedUserIdFallback: user?.id }
      );
      await createActivity.mutateAsync(payload);
      setQuickAddSubject("");
      showToast("success", t("dailyTasks.quickAddSuccess"));
    } catch {
      showToast("error", t("common.unknownError"));
    }
  }, [quickAddSubject, activityTypes, user?.id, createActivity, showToast, t]);

  const handleCalendarDateSelect = useCallback((date: string) => {
    setCalendarSelectedDate(date);
  }, []);

  const handleAddForDate = useCallback(
    (date: string) => {
      handleCreateTaskWithDate(date);
    },
    [handleCreateTaskWithDate]
  );

  const renderTab = useCallback(
    (item: { key: ViewMode; labelKey: string }) => {
      const isActive = activeTab === item.key;
      return (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.tab,
            isActive && { backgroundColor: colors.accent },
            !isActive && { backgroundColor: colors.backgroundSecondary },
          ]}
          onPress={() => setActiveTab(item.key)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              isActive && { color: "#FFFFFF" },
              !isActive && { color: colors.textSecondary },
            ]}
          >
            {t(item.labelKey)}
          </Text>
        </TouchableOpacity>
      );
    },
    [activeTab, colors, t]
  );

  const renderContent = (): React.ReactElement => {
    switch (activeTab) {
      case "weekly":
        return <WeeklyView onCreateTask={handleCreateTaskForSlot} />;
      case "daily":
        return <DailyView onCreateTask={() => handleCreateTaskWithDate(todayDateString)} />;
      case "calendar":
        return (
          <CalendarView
            selectedDate={calendarSelectedDate}
            onDateSelect={handleCalendarDateSelect}
            onAddForDate={handleAddForDate}
          />
        );
      default:
        return <DailyView onCreateTask={() => handleCreateTaskWithDate(todayDateString)} />;
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={t("dailyTasks.title")}
          showBackButton
          rightElement={
            <TouchableOpacity
              onPress={handleCreateTask}
              style={styles.addButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          }
        />
        <View style={[styles.content, { backgroundColor: contentBackground }]}>
          <View style={[styles.quickAddContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[
                styles.quickAddInput,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder={t("dailyTasks.quickAddPlaceholder")}
              placeholderTextColor={colors.textMuted}
              value={quickAddSubject}
              onChangeText={setQuickAddSubject}
              onSubmitEditing={handleQuickAdd}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.quickAddButton,
                { backgroundColor: colors.accent },
                !quickAddSubject.trim() && styles.quickAddButtonDisabled,
              ]}
              onPress={handleQuickAdd}
              disabled={!quickAddSubject.trim() || createActivity.isPending}
            >
              {createActivity.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.quickAddButtonText}>+</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.tabContainer}>{TAB_ITEMS.map(renderTab)}</View>
          <View style={styles.viewContainer}>{renderContent()}</View>
        </View>
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
  quickAddContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  quickAddInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  quickAddButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAddButtonDisabled: {
    opacity: 0.5,
  },
  quickAddButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "500",
    marginTop: -2,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  viewContainer: {
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addIcon: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "400",
    marginTop: -2,
  },
});
