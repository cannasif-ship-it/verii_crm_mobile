import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useActivity, useDeleteActivity, useUpdateActivity } from "../hooks";
import type { ActivityDto } from "../types";
import { ACTIVITY_STATUS_NUMERIC, ACTIVITY_PRIORITY_NUMERIC } from "../types";

function normalizeStatusForDisplay(status: ActivityDto["status"]): string {
  if (status == null) return "";
  if (typeof status === "number" && ACTIVITY_STATUS_NUMERIC[status as 0 | 1 | 2]) {
    return ACTIVITY_STATUS_NUMERIC[status as 0 | 1 | 2];
  }
  return String(status);
}

function normalizePriorityForDisplay(priority: ActivityDto["priority"]): string {
  if (priority == null) return "";
  if (typeof priority === "number" && ACTIVITY_PRIORITY_NUMERIC[priority as 0 | 1 | 2]) {
    return ACTIVITY_PRIORITY_NUMERIC[priority as 0 | 1 | 2];
  }
  return String(priority);
}

export function ActivityDetailScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const activityId = id ? Number(id) : undefined;
  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const { data: activity, isLoading, isError, refetch } = useActivity(activityId);
  const deleteActivity = useDeleteActivity();
  const updateActivity = useUpdateActivity();

  const handleEdit = useCallback(() => {
    if (activityId) {
      router.push(`/(tabs)/activities/edit/${activityId}`);
    }
  }, [activityId, router]);

  const handleDelete = useCallback(() => {
    Alert.alert(t("common.confirm"), t("activity.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (activityId) {
            await deleteActivity.mutateAsync(activityId);
            router.back();
          }
        },
      },
    ]);
  }, [activityId, deleteActivity, router, t]);

  const handleMarkComplete = useCallback(() => {
    if (!activity || !activityId) return;

    Alert.alert(
      t("common.confirm"),
      t("activity.completeConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          onPress: async () => {
            await updateActivity.mutateAsync({
              id: activityId,
              data: {
                subject: activity.subject,
                description: activity.description,
                activityTypeId: activity.activityTypeId ?? 0,
                startDateTime: activity.startDateTime || activity.activityDate || new Date().toISOString(),
                endDateTime: activity.endDateTime,
                isAllDay: activity.isAllDay ?? false,
                potentialCustomerId: activity.potentialCustomerId,
                erpCustomerCode: activity.erpCustomerCode,
                status: 1,
                priority: typeof activity.priority === "number" ? activity.priority : 1,
                contactId: activity.contactId,
                assignedUserId: activity.assignedUserId ?? 0,
                reminders: (activity.reminders || []).map((reminder) => ({
                  offsetMinutes: reminder.offsetMinutes,
                  channel: typeof reminder.channel === "number" ? reminder.channel : 0,
                })),
              },
            });
          },
        },
      ]
    );
  }, [activity, activityId, updateActivity, t]);

  const getStatusColor = (status: ActivityDto["status"]): string => {
    const statusLower = normalizeStatusForDisplay(status).toLowerCase().replace(/\s+/g, "");
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

  const getStatusText = (status: ActivityDto["status"]): string => {
    const statusLower = normalizeStatusForDisplay(status).toLowerCase().replace(/\s+/g, "");
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
        return normalizeStatusForDisplay(status);
    }
  };

  const getPriorityText = (priority?: ActivityDto["priority"]): string => {
    const p = normalizePriorityForDisplay(priority);
    switch (p.toLowerCase()) {
      case "high":
        return t("activity.priorityHigh");
      case "medium":
        return t("activity.priorityMedium");
      case "low":
        return t("activity.priorityLow");
      default:
        return p || "-";
    }
  };

  const getActivityTypeText = (activityType: ActivityDto["activityType"]): string => {
    if (typeof activityType === "string" && activityType) return activityType;
    if (activityType && typeof activityType === "object" && typeof activityType.name === "string") {
      return activityType.name;
    }
    return "-";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("activity.detail")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          </View>
        </View>
      </>
    );
  }

  if (isError || !activity) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("activity.detail")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>{t("common.error")}</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: colors.accent }]}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={t("activity.detail")}
          showBackButton
          rightContent={
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          }
        />
        <FlatList
          style={[styles.content, { backgroundColor: contentBackground }]}
          data={[0]}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <>
          <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.subject, { color: colors.text }]}>{activity.subject}</Text>
            <View style={styles.headerMeta}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) + "20" }]}>
                <Text style={[styles.statusText, { color: getStatusColor(activity.status) }]}>
                  {getStatusText(activity.status)}
                </Text>
              </View>
              {activity.priority !== undefined && activity.priority !== null && (
                <View style={[styles.priorityBadge, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.priorityText, { color: colors.textSecondary }]}>
                    {getPriorityText(activity.priority)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("activity.basicInfo")}</Text>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.activityType")}</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {getActivityTypeText(activity.activityType)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.activityDate")}</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {formatDate(activity.startDateTime || activity.activityDate || activity.createdDate)}
              </Text>
            </View>

            {activity.endDateTime && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.endDate")}</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {formatDate(activity.endDateTime)}
                </Text>
              </View>
            )}

            {activity.description && (
              <View style={styles.descriptionRow}>
                <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.description")}</Text>
                <Text style={[styles.description, { color: colors.text }]}>
                  {activity.description}
                </Text>
              </View>
            )}
          </View>

          {(activity.potentialCustomer || activity.contact || activity.assignedUser) && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("activity.relatedInfo")}</Text>

              {activity.potentialCustomer && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.customer")}</Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {activity.potentialCustomer.name}
                    {activity.potentialCustomer.customerCode && ` (${activity.potentialCustomer.customerCode})`}
                  </Text>
                </View>
              )}

              {activity.contact && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.contact")}</Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {activity.contact.fullName || `${activity.contact.firstName || ""} ${activity.contact.lastName || ""}`.trim()}
                  </Text>
                </View>
              )}

              {activity.assignedUser && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.assignedUser")}</Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {activity.assignedUser.fullName || activity.assignedUser.userName}
                  </Text>
                </View>
              )}
            </View>
          )}

          {(activity.productName || activity.productCode || activity.erpCustomerCode) && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("activity.productInfo")}</Text>

              {activity.productName && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.productName")}</Text>
                  <Text style={[styles.value, { color: colors.text }]}>{activity.productName}</Text>
                </View>
              )}

              {activity.productCode && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.productCode")}</Text>
                  <Text style={[styles.value, { color: colors.text }]}>{activity.productCode}</Text>
                </View>
              )}

              {activity.erpCustomerCode && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.erpCustomerCode")}</Text>
                  <Text style={[styles.value, { color: colors.text }]}>{activity.erpCustomerCode}</Text>
                </View>
              )}
            </View>
          )}

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("activity.systemInfo")}</Text>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.createdDate")}</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {formatDate(activity.createdDate)}
              </Text>
            </View>

            {activity.createdByFullUser && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.createdBy")}</Text>
                <Text style={[styles.value, { color: colors.text }]}>{activity.createdByFullUser}</Text>
              </View>
            )}

            {activity.updatedDate && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.updatedDate")}</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {formatDate(activity.updatedDate)}
                </Text>
              </View>
            )}

            {activity.updatedByFullUser && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textMuted }]}>{t("activity.updatedBy")}</Text>
                <Text style={[styles.value, { color: colors.text }]}>{activity.updatedByFullUser}</Text>
              </View>
            )}
          </View>

          {!activity.isCompleted && (
            <TouchableOpacity
              style={[styles.completeButton, { backgroundColor: colors.success }]}
              onPress={handleMarkComplete}
            >
              <Text style={styles.completeButtonText}>✓ {t("activity.markComplete")}</Text>
            </TouchableOpacity>
          )}
            </>
          )}
        />
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
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: {
    fontSize: 14,
  },
  headerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  subject: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  headerMeta: {
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  descriptionRow: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  completeButton: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
