import React, { memo, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { StatusBadge } from "./StatusBadge";
import { useStartTask, useCompleteTask, useHoldTask } from "../hooks";
import type { ActivityDto } from "../../activity/types";

interface TaskCardProps {
  task: ActivityDto;
  compact?: boolean;
}

const STATUS_BORDER_COLORS: Record<string, string> = {
  scheduled: "#3B82F6",
  inprogress: "#F59E0B",
  completed: "#10B981",
  cancelled: "#EF4444",
  canceled: "#EF4444",
  postponed: "#6B7280",
};

function TaskCardComponent({ task, compact = false }: TaskCardProps): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useUIStore();

  const { startTask, isPending: isStarting } = useStartTask();
  const { completeTask, isPending: isCompleting } = useCompleteTask();
  const { holdTask, isPending: isHolding } = useHoldTask();

  const normalizedStatus = task.status.toLowerCase().replace(/\s+/g, "");
  const borderColor = STATUS_BORDER_COLORS[normalizedStatus] || "#6B7280";

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
    });
  };

  const handlePress = useCallback(() => {
    router.push(`/(tabs)/activities/${task.id}`);
  }, [router, task.id]);

  const handleStart = useCallback(() => {
    startTask(task.id);
  }, [startTask, task.id]);

  const handleComplete = useCallback(() => {
    completeTask(task.id);
  }, [completeTask, task.id]);

  const handleHold = useCallback(() => {
    holdTask(task.id);
  }, [holdTask, task.id]);

  const isLoading = isStarting || isCompleting || isHolding;

  const getActivityTypeText = (): string => {
    if (typeof task.activityType === "string") {
      return task.activityType;
    }
    if (
      task.activityType &&
      typeof task.activityType === "object" &&
      typeof task.activityType.name === "string"
    ) {
      return task.activityType.name;
    }
    return "";
  };

  const renderActionButton = (): React.ReactElement | null => {
    if (task.isCompleted || normalizedStatus === "completed") {
      return null;
    }

    if (normalizedStatus === "scheduled" || normalizedStatus === "postponed") {
      return (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
          onPress={handleStart}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>{t("dailyTasks.start")}</Text>
        </TouchableOpacity>
      );
    }

    if (normalizedStatus === "inprogress") {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#10B981" }]}
            onPress={handleComplete}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>{t("dailyTasks.complete")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.holdButton, { borderColor: "#6B7280" }]}
            onPress={handleHold}
            disabled={isLoading}
          >
            <Text style={[styles.actionButtonText, { color: "#6B7280" }]}>
              {t("dailyTasks.hold")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { backgroundColor: colors.card, borderLeftColor: borderColor },
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactLeft}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              task.isCompleted && { backgroundColor: "#10B981", borderColor: "#10B981" },
              { borderColor: colors.border },
            ]}
            onPress={task.isCompleted ? undefined : handleComplete}
            disabled={isLoading || task.isCompleted}
          >
            {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <View style={styles.compactContent}>
            <Text
              style={[
                styles.compactSubject,
                { color: colors.text },
                task.isCompleted && styles.completedText,
              ]}
              numberOfLines={1}
            >
              {task.subject}
            </Text>
            <Text style={[styles.compactTime, { color: colors.textMuted }]}>
              {formatTime(task.activityDate)}
            </Text>
          </View>
        </View>
        <StatusBadge status={task.status} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderLeftColor: borderColor },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.dateTime}>
          <Text style={[styles.date, { color: colors.text }]}>{formatDate(task.activityDate)}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>{formatTime(task.activityDate)}</Text>
        </View>
        <StatusBadge status={task.status} />
      </View>

      <Text style={[styles.subject, { color: colors.text }]} numberOfLines={2}>
        {task.subject}
      </Text>

      {task.potentialCustomer?.name && (
        <View style={styles.customerRow}>
          <Text style={styles.customerIcon}>👤</Text>
          <Text style={[styles.customerName, { color: colors.textSecondary }]} numberOfLines={1}>
            {task.potentialCustomer.name}
          </Text>
        </View>
      )}

      {getActivityTypeText() ? (
        <View style={styles.typeRow}>
          <Text style={[styles.typeLabel, { color: colors.textMuted }]}>
            {getActivityTypeText()}
          </Text>
        </View>
      ) : null}

      {renderActionButton()}
    </TouchableOpacity>
  );
}

export const TaskCard = memo(TaskCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  dateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: "600",
  },
  time: {
    fontSize: 13,
  },
  subject: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 22,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  customerIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  customerName: {
    fontSize: 14,
    flex: 1,
  },
  typeRow: {
    marginTop: 4,
  },
  typeLabel: {
    fontSize: 12,
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  holdButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    marginBottom: 8,
  },
  compactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  compactContent: {
    flex: 1,
    marginRight: 12,
  },
  compactSubject: {
    fontSize: 15,
    fontWeight: "500",
  },
  compactTime: {
    fontSize: 12,
    marginTop: 2,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
});
