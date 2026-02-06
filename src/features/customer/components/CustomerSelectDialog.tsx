import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useCustomers } from "../hooks";
import type { CustomerGetDto } from "../types";

export interface CustomerSelectionResult {
  customerId: number;
  erpCustomerCode?: string;
  customerName: string;
}

type CustomerType = "erp" | "potential";

interface CustomerWithType extends CustomerGetDto {
  type: CustomerType;
}

function getCustomerType(c: CustomerGetDto): CustomerType {
  const isIntegrated = c.isERPIntegrated === true;
  const hasCode =
    c.customerCode != null && String(c.customerCode).trim() !== "";
  return isIntegrated || hasCode ? "erp" : "potential";
}

interface CustomerSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: CustomerSelectionResult) => void;
  showNewCustomerButton?: boolean;
  onNewCustomer?: () => void;
}

const PAGE_SIZE = 50;
const BADGE_ERP = "#8B5CF6";
const BADGE_POTENTIAL = "#EC4899";

export function CustomerSelectDialog({
  open,
  onOpenChange,
  onSelect,
  showNewCustomerButton = false,
  onNewCustomer,
}: CustomerSelectDialogProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"erp" | "potential" | "all">("all");

  const {
    data: pagesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useCustomers({
    pageSize: PAGE_SIZE,
    sortBy: "Id",
    sortDirection: "asc",
  });

  const allItems = useMemo(
    () => pagesData?.pages.flatMap((p) => p.items) ?? [],
    [pagesData]
  );

  const itemsWithType = useMemo((): CustomerWithType[] => {
    return allItems.map((c) => ({ ...c, type: getCustomerType(c) }));
  }, [allItems]);

  const filteredItems = useMemo((): CustomerWithType[] => {
    const q = searchQuery.trim().toLowerCase();
    let list = itemsWithType;
    if (activeTab === "erp") list = list.filter((c) => c.type === "erp");
    else if (activeTab === "potential")
      list = list.filter((c) => c.type === "potential");
    if (q) {
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          (c.customerCode != null &&
            String(c.customerCode).toLowerCase().includes(q))
      );
    }
    return list;
  }, [itemsWithType, activeTab, searchQuery]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setActiveTab("all");
    }
  }, [open]);

  useEffect(() => {
    if (open) refetch();
  }, [open, refetch]);

  const handleSelect = useCallback(
    (item: CustomerWithType) => {
      onSelect({
        customerId: item.id,
        erpCustomerCode:
          item.type === "erp" && item.customerCode
            ? item.customerCode
            : undefined,
        customerName: item.name,
      });
      onOpenChange(false);
    },
    [onSelect, onOpenChange]
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const emptyMessage = useMemo((): string => {
    if (searchQuery.trim()) return t("common.noResults");
    if (activeTab === "erp") return t("customer.selectEmptyErp");
    if (activeTab === "potential") return t("customer.selectEmptyPotential");
    return t("customer.selectEmptyAll");
  }, [searchQuery, activeTab, t]);

  const renderItem = useCallback(
    ({ item }: { item: CustomerWithType }) => (
      <CustomerSelectRow
        item={item}
        onPress={() => handleSelect(item)}
        colors={colors}
        t={t}
      />
    ),
    [handleSelect, colors, t]
  );

  const renderEmpty = useCallback((): React.ReactElement | null => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }, [isLoading, emptyMessage, colors.textMuted]);

  const keyExtractor = useCallback((item: CustomerWithType) => String(item.id), []);

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={handleClose} />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <View style={styles.headerContent}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("customer.selectCustomer")}
              </Text>
              <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                {t("customer.searchPlaceholder")}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t("customer.searchPlaceholder")}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "erp" && [
                  styles.tabActive,
                  { backgroundColor: BADGE_ERP },
                ],
              ]}
              onPress={() => setActiveTab("erp")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === "erp" ? "#FFFFFF" : colors.textSecondary,
                  },
                ]}
              >
                {t("customer.selectTabErp")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "potential" && [
                  styles.tabActive,
                  { backgroundColor: BADGE_POTENTIAL },
                ],
              ]}
              onPress={() => setActiveTab("potential")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "potential"
                        ? "#FFFFFF"
                        : colors.textSecondary,
                  },
                ]}
              >
                {t("customer.selectTabPotential")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "all" && [
                  styles.tabActive,
                  { backgroundColor: colors.accent },
                ],
              ]}
              onPress={() => setActiveTab("all")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "all" ? "#FFFFFF" : colors.textSecondary,
                  },
                ]}
              >
                {t("customer.selectTabAll")}
              </Text>
            </TouchableOpacity>
            {showNewCustomerButton && onNewCustomer ? (
              <TouchableOpacity
                style={[styles.newCustomerButton, { backgroundColor: colors.accent }]}
                onPress={onNewCustomer}
              >
                <Text style={styles.newCustomerButtonText}>
                  {t("customer.create")}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {t("common.loading")}
              </Text>
            </View>
          ) : filteredItems.length === 0 ? (
            renderEmpty()
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmpty}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator size="small" color={colors.accent} />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

interface CustomerSelectRowProps {
  item: CustomerWithType;
  onPress: () => void;
  colors: Record<string, string>;
  t: (key: string) => string;
}

function CustomerSelectRow({
  item,
  onPress,
  colors,
  t,
}: CustomerSelectRowProps): React.ReactElement {
  const badgeColor = item.type === "erp" ? BADGE_ERP : BADGE_POTENTIAL;
  const badgeLabel =
    item.type === "erp"
      ? t("customer.selectBadgeErp")
      : t("customer.selectBadgePotential");
  const location = [item.cityName, item.districtName]
    .filter(Boolean)
    .join(", ");

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowHeader}>
        <View style={[styles.badge, { backgroundColor: badgeColor + "25" }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {badgeLabel}
          </Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </View>
      <Text style={[styles.rowCode, { color: colors.textMuted }]} numberOfLines={1}>
        {item.customerCode ?? "—"}
      </Text>
      <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={styles.rowDetails}>
        {item.phone ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text
              style={[styles.detailText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.phone}
            </Text>
          </View>
        ) : null}
        {item.email ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>✉️</Text>
            <Text
              style={[styles.detailText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.email}
            </Text>
          </View>
        ) : null}
        {location ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text
              style={[styles.detailText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  handle: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  headerContent: {
    marginTop: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 20,
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "300",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  tabActive: {
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  newCustomerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  newCustomerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
  },
  row: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: "300",
    color: "#9CA3AF",
  },
  rowCode: {
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  rowName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  rowDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailIcon: {
    fontSize: 14,
    width: 20,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
});
