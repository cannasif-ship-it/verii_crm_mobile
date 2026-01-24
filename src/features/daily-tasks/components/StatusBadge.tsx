import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";

interface StatusBadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3B82F6",
  inprogress: "#F59E0B",
  completed: "#10B981",
  cancelled: "#EF4444",
  canceled: "#EF4444",
  postponed: "#6B7280",
};

function StatusBadgeComponent({ status }: StatusBadgeProps): React.ReactElement {
  const { t } = useTranslation();

  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "");
  const color = STATUS_COLORS[normalizedStatus] || "#6B7280";

  const getStatusLabel = (): string => {
    switch (normalizedStatus) {
      case "scheduled":
        return t("dailyTasks.statusScheduled");
      case "inprogress":
        return t("dailyTasks.statusInProgress");
      case "completed":
        return t("dailyTasks.statusCompleted");
      case "cancelled":
      case "canceled":
        return t("dailyTasks.statusCancelled");
      case "postponed":
        return t("dailyTasks.statusPostponed");
      default:
        return status;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: color + "20" }]}>
      <Text style={[styles.badgeText, { color }]}>{getStatusLabel()}</Text>
    </View>
  );
}

export const StatusBadge = memo(StatusBadgeComponent);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
