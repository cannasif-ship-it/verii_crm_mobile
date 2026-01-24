import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { ActivityDto } from "../types";

interface ActivityCardProps {
  activity: ActivityDto;
  onPress: () => void;
}

function ActivityCardComponent({ activity, onPress }: ActivityCardProps): React.ReactElement {
  const { colors } = useUIStore();
  const { t } = useTranslation();

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase().replace(/\s+/g, "");
    switch (statusLower) {
      case "completed":
        return colors.success;
      case "inprogress":
        return colors.warning;
      case "scheduled":
        return colors.accent;
      case "cancelled":
      case "canceled":
        return colors.error;
      case "postponed":
        return colors.textMuted;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = (status: string): string => {
    const statusLower = status.toLowerCase().replace(/\s+/g, "");
    switch (statusLower) {
      case "completed":
        return t("activity.statusCompleted");
      case "inprogress":
        return t("activity.statusInProgress");
      case "scheduled":
        return t("activity.statusScheduled");
      case "cancelled":
      case "canceled":
        return t("activity.statusCancelled");
      case "postponed":
        return t("activity.statusPostponed");
      default:
        return status;
    }
  };

  const getPriorityIcon = (priority?: string): string => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.typeIcon}>{getActivityTypeIcon(activity.activityType)}</Text>
            <Text style={[styles.subject, { color: colors.text }]} numberOfLines={1}>
              {activity.subject}
            </Text>
            {activity.priority && (
              <Text style={styles.priorityIcon}>{getPriorityIcon(activity.priority)}</Text>
            )}
          </View>
          {activity.potentialCustomer?.name && (
            <Text style={[styles.customer, { color: colors.textMuted }]} numberOfLines={1}>
              {activity.potentialCustomer.name}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(activity.status) }]}>
            {getStatusText(activity.status)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {formatDate(activity.activityDate)}
          </Text>
        </View>
        {activity.contact?.fullName && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👤</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {activity.contact.fullName}
            </Text>
          </View>
        )}
        {activity.assignedUser?.fullName && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👨‍💼</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {activity.assignedUser.fullName}
            </Text>
          </View>
        )}
      </View>

      {activity.isCompleted && (
        <View style={[styles.completedBadge, { backgroundColor: colors.success + "15" }]}>
          <Text style={[styles.completedText, { color: colors.success }]}>
            ✓ {t("activity.completed")}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export const ActivityCard = memo(ActivityCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  subject: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  priorityIcon: {
    fontSize: 12,
    marginLeft: 6,
  },
  customer: {
    fontSize: 13,
    marginLeft: 24,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  details: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  completedBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  completedText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
