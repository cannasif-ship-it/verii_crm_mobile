import React from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useDemandApprovalFlowReport } from "../hooks/useDemandApprovalFlowReport";
import type { DemandApprovalFlowReportDto, ApprovalFlowStepReportDto, ApprovalActionDetailDto } from "../types";

const STEP_STATUS_NOT_STARTED = "NotStarted";
const STEP_STATUS_IN_PROGRESS = "InProgress";
const STEP_STATUS_COMPLETED = "Completed";
const STEP_STATUS_REJECTED = "Rejected";

function formatActionDate(isoDate: string | null, locale: string): string {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString(locale === "en" ? "en-GB" : "tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

interface DemandApprovalFlowTabProps {
  demandId: number;
}

function StepIcon({ stepStatus }: { stepStatus: string }): React.ReactElement {
  const { colors } = useUIStore();
  if (stepStatus === STEP_STATUS_COMPLETED) {
    return <Text style={[styles.stepIcon, { color: colors.success }]}>✓</Text>;
  }
  if (stepStatus === STEP_STATUS_IN_PROGRESS) {
    return <Text style={[styles.stepIcon, { color: colors.warning }]}>⏳</Text>;
  }
  if (stepStatus === STEP_STATUS_REJECTED) {
    return <Text style={[styles.stepIcon, { color: colors.error }]}>✗</Text>;
  }
  return <Text style={[styles.stepIcon, { color: colors.textMuted }]}>○</Text>;
}

function ActionRow({ action, locale }: { action: ApprovalActionDetailDto; locale: string }): React.ReactElement {
  const { colors } = useUIStore();
  const isApproved = action.status === 2;
  const isRejected = action.status === 3;
  const actionColor = isApproved ? colors.success : isRejected ? colors.error : colors.textMuted;
  return (
    <View style={[styles.actionRow, { borderBottomColor: colors.border }]}>
      <View style={styles.actionLeft}>
        <Text style={[styles.actionName, { color: colors.text }]} numberOfLines={1}>
          {action.userFullName ?? action.userEmail ?? String(action.userId)}
        </Text>
        {action.userEmail ? (
          <Text style={[styles.actionEmail, { color: colors.textMuted }]} numberOfLines={1}>
            {action.userEmail}
          </Text>
        ) : null}
      </View>
      <View style={styles.actionRight}>
        <Text style={[styles.actionStatus, { color: actionColor }]}>{action.statusName}</Text>
        {action.actionDate ? (
          <Text style={[styles.actionDate, { color: colors.textMuted }]}>
            {formatActionDate(action.actionDate, locale)}
          </Text>
        ) : null}
        {action.rejectedReason ? (
          <Text style={[styles.actionRejectReason, { color: colors.error }]} numberOfLines={3}>
            {action.rejectedReason}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function StepCard({ step, locale }: { step: ApprovalFlowStepReportDto; locale: string }): React.ReactElement {
  const { colors } = useUIStore();
  const borderColor =
    step.stepStatus === STEP_STATUS_REJECTED
      ? colors.error
      : step.stepStatus === STEP_STATUS_IN_PROGRESS
        ? colors.warning
        : step.stepStatus === STEP_STATUS_COMPLETED
          ? colors.success
          : colors.border;
  return (
    <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor }]}>
      <View style={styles.stepHeader}>
        <StepIcon stepStatus={step.stepStatus} />
        <Text style={[styles.stepName, { color: colors.text }]}>{step.stepName}</Text>
        <Text style={[styles.stepStatusLabel, { color: colors.textSecondary }]}>{step.stepStatus}</Text>
      </View>
      {step.actions.length > 0 ? (
        <View style={styles.actionsContainer}>
          {step.actions.map((action, idx) => (
            <ActionRow key={`${action.userId}-${idx}`} action={action} locale={locale} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function DemandApprovalFlowTab({ demandId }: DemandApprovalFlowTabProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const { colors } = useUIStore();
  const { data, isLoading, isError, error, refetch } = useDemandApprovalFlowReport(demandId);
  const locale = i18n.language?.startsWith("en") ? "en" : "tr";

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centered, styles.errorBox, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error?.message ?? t("common.error")}
        </Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.accent }]} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>{t("common.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t("common.error")}</Text>
      </View>
    );
  }

  if (!data.hasApprovalRequest) {
    return (
      <View style={[styles.centered, styles.emptyBox, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {t("demand.approvalFlow.notStarted")}
        </Text>
      </View>
    );
  }

  return (
    <FlatListScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {data.flowDescription ? (
        <View style={[styles.flowDescriptionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.flowDescriptionLabel, { color: colors.textSecondary }]}>
            {t("demand.approvalFlow.flowDescription")}
          </Text>
          <Text style={[styles.flowDescription, { color: colors.text }]}>{data.flowDescription}</Text>
        </View>
      ) : null}
      {data.overallStatusName ? (
        <View style={[styles.overallRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.overallLabel, { color: colors.textSecondary }]}>
            {t("demand.approvalFlow.overallStatus")}
          </Text>
          <Text style={[styles.overallValue, { color: colors.text }]}>{data.overallStatusName}</Text>
        </View>
      ) : null}
      {data.rejectedReason ? (
        <View style={[styles.rejectedBox, { backgroundColor: colors.error + "20", borderColor: colors.error }]}>
          <Text style={[styles.rejectedLabel, { color: colors.error }]}>
            {t("demand.approvalFlow.rejectedReason")}
          </Text>
          <Text style={[styles.rejectedText, { color: colors.text }]}>{data.rejectedReason}</Text>
        </View>
      ) : null}
      {data.steps.map((step) => (
        <StepCard key={step.stepOrder} step={step} locale={locale} />
      ))}
    </FlatListScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorBox: { flex: 1 },
  errorText: { fontSize: 14, textAlign: "center", marginBottom: 16 },
  retryBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  retryBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  emptyBox: { flex: 1 },
  emptyText: { fontSize: 15, textAlign: "center" },
  flowDescriptionBox: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  flowDescriptionLabel: { fontSize: 12, marginBottom: 4 },
  flowDescription: { fontSize: 14, fontWeight: "500" },
  overallRow: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  overallLabel: { fontSize: 12, marginBottom: 4 },
  overallValue: { fontSize: 14, fontWeight: "600" },
  rejectedBox: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  rejectedLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  rejectedText: { fontSize: 14 },
  stepCard: { padding: 12, borderRadius: 10, borderWidth: 2, marginBottom: 12 },
  stepHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  stepIcon: { fontSize: 18, marginRight: 8 },
  stepName: { fontSize: 15, fontWeight: "600", flex: 1 },
  stepStatusLabel: { fontSize: 12 },
  actionsContainer: { marginTop: 4 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  actionLeft: { flex: 1, marginRight: 12 },
  actionName: { fontSize: 14, fontWeight: "500" },
  actionEmail: { fontSize: 12, marginTop: 2 },
  actionRight: { flex: 1 },
  actionStatus: { fontSize: 13, fontWeight: "500" },
  actionDate: { fontSize: 11, marginTop: 2 },
  actionRejectReason: { fontSize: 12, marginTop: 4 },
});
