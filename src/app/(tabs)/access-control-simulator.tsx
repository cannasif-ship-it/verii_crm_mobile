import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft01Icon } from "hugeicons-react-native";

import { Text } from "../../components/ui/text";
import { useUIStore } from "../../store/ui";
import { useAuthStore } from "../../store/auth";
import { visibilitySimulatorApi } from "../../features/access-control/api/visibilitySimulatorApi";

const ENTITY_OPTIONS = [
  { value: "Quotation", labelKey: "accessControlSimulator.entityQuotation" },
  { value: "Demand", labelKey: "accessControlSimulator.entityDemand" },
  { value: "Order", labelKey: "accessControlSimulator.entityOrder" },
  { value: "Activity", labelKey: "accessControlSimulator.entityActivity" },
];

export default function AccessControlSimulatorScreen(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors } = useUIStore();
  const currentUser = useAuthStore((state) => state.user);

  const [selectedEntityType, setSelectedEntityType] = useState("Quotation");
  const [userIdInput, setUserIdInput] = useState(currentUser?.id ? String(currentUser.id) : "");
  const [recordIdInput, setRecordIdInput] = useState("");

  const userId = useMemo(() => {
    const numeric = Number.parseInt(userIdInput, 10);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }, [userIdInput]);

  const recordId = useMemo(() => {
    const numeric = Number.parseInt(recordIdInput, 10);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }, [recordIdInput]);

  const previewQuery = useQuery({
    queryKey: ["mobile-visibility-preview", userId, selectedEntityType],
    enabled: userId != null,
    queryFn: () => visibilitySimulatorApi.preview(userId!, selectedEntityType),
  });

  const simulationQuery = useQuery({
    queryKey: ["mobile-visibility-simulate", userId, selectedEntityType, recordId],
    enabled: userId != null && recordId != null,
    queryFn: () => visibilitySimulatorApi.simulate(userId!, selectedEntityType, recordId!),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={colors.background === "#0c0516" ? "light" : "dark"} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <ArrowLeft01Icon size={18} color={colors.text} variant="stroke" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("accessControlSimulator.title")}
        </Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>{t("accessControlSimulator.filtersTitle")}</Text>
          <Text style={[styles.panelDescription, { color: colors.textSecondary }]}>
            {t("accessControlSimulator.filtersDescription")}
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>{t("accessControlSimulator.userId")}</Text>
            <TextInput
              value={userIdInput}
              onChangeText={(value) => setUserIdInput(value.replace(/[^\d]/g, ""))}
              placeholder={currentUser?.id ? String(currentUser.id) : "1"}
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>{t("accessControlSimulator.entity")}</Text>
            <View style={styles.optionRow}>
              {ENTITY_OPTIONS.map((option) => {
                const isActive = option.value === selectedEntityType;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSelectedEntityType(option.value)}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: isActive ? colors.accent : colors.background,
                        borderColor: isActive ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ color: isActive ? "#fff" : colors.text, fontWeight: "700", fontSize: 12 }}>
                      {t(option.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>{t("accessControlSimulator.recordId")}</Text>
            <TextInput
              value={recordIdInput}
              onChangeText={(value) => setRecordIdInput(value.replace(/[^\d]/g, ""))}
              placeholder="125"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            label={t("accessControlSimulator.visibleUsers")}
            value={String(previewQuery.data?.visibleUsers.length ?? 0)}
            colors={colors}
          />
          <SummaryCard
            label={t("accessControlSimulator.approvalOverrides")}
            value={String(previewQuery.data?.approvalOverrideAuditEntries.length ?? 0)}
            colors={colors}
          />
        </View>

        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>{t("accessControlSimulator.actionPanelTitle")}</Text>
          {recordId == null ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("accessControlSimulator.noRecordSimulation")}</Text>
          ) : simulationQuery.isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : simulationQuery.data ? (
            <View style={styles.actionList}>
              {simulationQuery.data.actions.map((action) => (
                <View key={action.action} style={[styles.actionCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>{t(`accessControlSimulator.action.${action.action}`)}</Text>
                  <Text
                    style={[
                      styles.actionStatus,
                      { color: action.allowed ? "#10B981" : "#EF4444" },
                    ]}
                  >
                    {action.allowed ? t("accessControlSimulator.allowed") : t("accessControlSimulator.denied")}
                  </Text>
                  <Text style={[styles.actionReason, { color: colors.textSecondary }]}>{action.reason}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("accessControlSimulator.awaitingSelection")}</Text>
          )}
        </View>

        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>{t("accessControlSimulator.auditTitle")}</Text>
          {previewQuery.isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : previewQuery.data?.approvalOverrideAuditEntries.length ? (
            <View style={styles.auditList}>
              {previewQuery.data.approvalOverrideAuditEntries.map((entry) => (
                <View key={entry.approvalActionId} style={[styles.auditCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.auditTitle, { color: colors.text }]}>
                    {t("accessControlSimulator.auditRecord", { id: entry.entityId })}
                  </Text>
                  <Text style={[styles.auditMeta, { color: colors.textSecondary }]}>
                    {t("accessControlSimulator.auditStep", { step: entry.stepOrder, current: entry.currentStep })}
                  </Text>
                  <Text style={[styles.auditMeta, { color: colors.textSecondary }]}>
                    {t("accessControlSimulator.auditFlow")}: {entry.flowDescription || "-"}
                  </Text>
                  <Text style={[styles.auditMeta, { color: colors.textSecondary }]}>
                    {t("accessControlSimulator.auditApprover")}: {entry.approvedByUserName || `#${entry.approvedByUserId}`}
                  </Text>
                  <Text style={[styles.auditReason, { color: colors.text }]}>{entry.reason}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("accessControlSimulator.noAudit")}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useUIStore.getState>["colors"];
}): React.ReactElement {
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  placeholder: { width: 38 },
  content: {
    padding: 20,
    gap: 16,
  },
  panel: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  panelDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
  },
  actionList: {
    gap: 12,
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  actionStatus: {
    fontSize: 13,
    fontWeight: "800",
  },
  actionReason: {
    fontSize: 13,
    lineHeight: 20,
  },
  auditList: {
    gap: 12,
  },
  auditCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  auditTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  auditMeta: {
    fontSize: 12,
    lineHeight: 18,
  },
  auditReason: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
