import React from "react";
import { View, StyleSheet } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { Text } from "../../../components/ui/text";
import type { CustomerDto } from "../types";

function DetailRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string | undefined | null;
  colors: Record<string, string>;
}): React.ReactElement | null {
  if (!value) return null;

  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

interface StatusBadgeProps {
  isActive: boolean;
  activeText: string;
  inactiveText: string;
}

function StatusBadge({ isActive, activeText, inactiveText }: StatusBadgeProps): React.ReactElement {
  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: isActive ? "#10B98120" : "#EF444420" },
      ]}
    >
      <View
        style={[
          styles.statusDot,
          { backgroundColor: isActive ? "#10B981" : "#EF4444" },
        ]}
      />
      <Text
        style={[
          styles.statusText,
          { color: isActive ? "#10B981" : "#EF4444" },
        ]}
      >
        {isActive ? activeText : inactiveText}
      </Text>
    </View>
  );
}

function formatDate(dateString: string | undefined | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

interface CustomerDetailContentProps {
  customer: CustomerDto | undefined;
  colors: Record<string, string>;
  insets: { bottom: number };
  t: (key: string) => string;
}

export function CustomerDetailContent({
  customer,
  colors,
  insets,
  t,
}: CustomerDetailContentProps): React.ReactElement {
  const locationParts: string[] = [];
  if (customer?.countryName) locationParts.push(customer.countryName);
  if (customer?.cityName) locationParts.push(customer.cityName);
  if (customer?.districtName) locationParts.push(customer.districtName);

  const hasContactInfo = customer?.phone || customer?.phone2 || customer?.email || customer?.website;
  const hasLocationInfo = customer?.address || locationParts.length > 0;
  const hasTaxInfo = customer?.taxNumber || customer?.taxOffice || customer?.tcknNumber;
  const hasBusinessInfo = customer?.salesRepCode || customer?.groupCode || customer?.creditLimit !== undefined;
  const hasApprovalInfo = customer?.approvalStatus || customer?.isPendingApproval || customer?.isCompleted !== undefined || customer?.rejectedReason;
  const hasERPInfo = customer?.erpIntegrationNumber || customer?.isERPIntegrated !== undefined || customer?.lastSyncDate;

  return (
    <FlatListScrollView
      style={styles.tabContent}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.customerName, { color: colors.text }]}>{customer?.name}</Text>
            {customer?.customerCode && (
              <Text style={[styles.customerCode, { color: colors.textMuted }]}>
                #{customer.customerCode}
              </Text>
            )}
          </View>
          {customer?.customerTypeName && (
            <View style={[styles.badge, { backgroundColor: colors.activeBackground }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>
                {customer.customerTypeName}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.statusRow}>
          {customer?.isCompleted !== undefined && (
            <StatusBadge
              isActive={customer.isCompleted}
              activeText={t("customer.statusCompleted")}
              inactiveText={t("customer.statusPending")}
            />
          )}
          {customer?.isPendingApproval && (
            <View style={[styles.pendingBadge, { backgroundColor: "#F59E0B20" }]}>
              <Text style={[styles.pendingText, { color: "#F59E0B" }]}>
                {t("customer.isPendingApproval")}
              </Text>
            </View>
          )}
        </View>
        {customer?.year && (
          <Text style={[styles.yearText, { color: colors.textMuted }]}>
            {t("customer.year")}: {customer.year}
          </Text>
        )}
      </View>

      {hasContactInfo && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("customer.contactInfo")}
          </Text>
          <DetailRow label={t("customer.phone")} value={customer?.phone} colors={colors} />
          <DetailRow label={t("customer.phone2")} value={customer?.phone2} colors={colors} />
          <DetailRow label={t("customer.email")} value={customer?.email} colors={colors} />
          <DetailRow label={t("customer.website")} value={customer?.website} colors={colors} />
        </View>
      )}

      {hasLocationInfo && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("lookup.location")}
          </Text>
          <DetailRow label={t("customer.address")} value={customer?.address} colors={colors} />
          <DetailRow label={t("lookup.country")} value={customer?.countryName} colors={colors} />
          <DetailRow label={t("lookup.city")} value={customer?.cityName} colors={colors} />
          <DetailRow label={t("lookup.district")} value={customer?.districtName} colors={colors} />
        </View>
      )}

      {hasTaxInfo && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("customer.taxInfo")}
          </Text>
          <DetailRow label={t("customer.taxNumber")} value={customer?.taxNumber} colors={colors} />
          <DetailRow label={t("customer.taxOffice")} value={customer?.taxOffice} colors={colors} />
          <DetailRow label={t("customer.tcknNumber")} value={customer?.tcknNumber} colors={colors} />
        </View>
      )}

      {hasBusinessInfo && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("customer.groupCode")}
          </Text>
          <DetailRow label={t("customer.salesRepCode")} value={customer?.salesRepCode} colors={colors} />
          <DetailRow label={t("customer.groupCode")} value={customer?.groupCode} colors={colors} />
          <DetailRow label={t("customer.creditLimit")} value={formatCurrency(customer?.creditLimit)} colors={colors} />
          <DetailRow label={t("customer.branchCode")} value={String(customer?.branchCode)} colors={colors} />
          <DetailRow label={t("customer.businessUnitCode")} value={String(customer?.businessUnitCode)} colors={colors} />
        </View>
      )}

      {hasApprovalInfo && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("customer.approvalInfo")}
          </Text>
          <DetailRow label={t("customer.approvalStatus")} value={customer?.approvalStatus} colors={colors} />
          <DetailRow label={t("customer.approvalDate")} value={formatDate(customer?.approvalDate)} colors={colors} />
          <DetailRow label={t("customer.completionDate")} value={formatDate(customer?.completionDate)} colors={colors} />
          <DetailRow label={t("customer.rejectedReason")} value={customer?.rejectedReason} colors={colors} />
        </View>
      )}

      {hasERPInfo && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("customer.isERPIntegrated")}
          </Text>
          <DetailRow label={t("customer.erpIntegrationNumber")} value={customer?.erpIntegrationNumber} colors={colors} />
          {customer?.isERPIntegrated !== undefined && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                {t("customer.isERPIntegrated")}
              </Text>
              <StatusBadge
                isActive={customer.isERPIntegrated}
                activeText={t("customer.statusYes")}
                inactiveText={t("customer.statusNo")}
              />
            </View>
          )}
          <DetailRow label={t("customer.lastSyncDate")} value={formatDate(customer?.lastSyncDate)} colors={colors} />
        </View>
      )}

      {customer?.notes && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("customer.notes")}
          </Text>
          <Text style={[styles.notes, { color: colors.textSecondary }]}>{customer.notes}</Text>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("customer.systemInfo")}
        </Text>
        <DetailRow label={t("customer.createdBy")} value={customer?.createdByFullUser} colors={colors} />
        <DetailRow label={t("customer.createdDate")} value={formatDate(customer?.createdDate)} colors={colors} />
        <DetailRow label={t("customer.updatedBy")} value={customer?.updatedByFullUser} colors={colors} />
        <DetailRow label={t("customer.updatedDate")} value={formatDate(customer?.updatedDate)} colors={colors} />
      </View>
    </FlatListScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderLeft: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "600",
  },
  customerCode: {
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: "500",
  },
  yearText: {
    fontSize: 13,
    marginTop: 8,
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
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
  },
  notes: {
    fontSize: 15,
    lineHeight: 22,
  },
});
