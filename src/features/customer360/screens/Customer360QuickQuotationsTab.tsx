import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import type { Customer360QuickQuotationDto } from "../types";

interface Customer360QuickQuotationsTabProps {
  items: Customer360QuickQuotationDto[];
  colors: Record<string, string>;
  emptyText: string;
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function Customer360QuickQuotationsTab({
  items,
  colors,
  emptyText,
}: Customer360QuickQuotationsTabProps): React.ReactElement {
  const router = useRouter();
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <FlatListScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {items.map((item) => (
        <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>#{item.id}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {formatDate(item.offerDate)}
                {item.quotationNo ? ` · ${item.quotationNo}` : ""}
              </Text>
            </View>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: item.hasConvertedQuotation ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)" }]}>
                <Text style={[styles.badgeText, { color: item.hasConvertedQuotation ? "#16a34a" : "#d97706" }]}>
                  {item.hasConvertedQuotation ? t("customer360.quickQuotations.converted") : t("customer360.quickQuotations.draft")}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.hasApprovalRequest ? "rgba(59,130,246,0.12)" : "rgba(100,116,139,0.12)" }]}>
                <Text style={[styles.badgeText, { color: item.hasApprovalRequest ? "#2563eb" : colors.textMuted }]}>
                  {item.hasApprovalRequest ? (item.approvalStatusName ?? t("customer360.quickQuotations.sentToApproval")) : t("customer360.quickQuotations.notSentToApproval")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.cell}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t("customer360.quickQuotations.currency")}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{item.currencyCode}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t("customer360.quickQuotations.total")}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{formatAmount(item.totalAmount)}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t("customer360.quickQuotations.quotationStatus")}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{item.quotationStatusName ?? "-"}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={[styles.label, { color: colors.textMuted }]}>{t("customer360.quickQuotations.approvalStep")}</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {item.approvalCurrentStep ? t("customer360.quickQuotations.stepValue", { step: item.approvalCurrentStep }) : "-"}
              </Text>
            </View>
          </View>

          {item.description ? (
            <Text style={[styles.description, { color: colors.textMuted }]}>{item.description}</Text>
          ) : null}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {item.approvedDate ? t("customer360.quickQuotations.convertedAt", { date: formatDate(item.approvedDate) }) : t("customer360.quickQuotations.notConvertedYet")}
              {item.approvalFlowDescription ? ` · ${item.approvalFlowDescription}` : ""}
            </Text>
            {item.quotationId ? (
              <TouchableOpacity onPress={() => router.push(`/(tabs)/sales/quotations/${item.quotationId}`)}>
                <Text style={[styles.link, { color: colors.accent }]}>{t("customer360.quickQuotations.openQuotation")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ))}
    </FlatListScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 100, gap: 12 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { fontSize: 14, textAlign: "center" },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 14 },
  cardHeader: { gap: 10 },
  title: { fontSize: 16, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 4 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cell: { width: "47%", gap: 4 },
  label: { fontSize: 12 },
  value: { fontSize: 14, fontWeight: "600" },
  description: { fontSize: 13, lineHeight: 18 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  footerText: { fontSize: 12, flex: 1 },
  link: { fontSize: 13, fontWeight: "700" },
});
