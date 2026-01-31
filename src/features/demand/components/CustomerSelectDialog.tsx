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
import { VoiceSearchButton } from "./VoiceSearchButton";
import { useErpCustomers } from "../../erp-customer/hooks";
import { useCustomers } from "../../customer/hooks";
import type { CariDto } from "../../erp-customer/types";
import type { CustomerDto } from "../../customer/types";

interface CustomerSelectionResult {
  customerId?: number;
  erpCustomerCode?: string;
}

interface CustomerSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: CustomerSelectionResult) => void;
}

interface CombinedCustomer {
  type: "erp" | "crm";
  id?: number;
  erpCode?: string;
  name: string;
  customerCode?: string;
  phone?: string;
  email?: string;
  city?: string;
  district?: string;
}

type TabType = "erp" | "crm" | "all";

export function CustomerSelectDialog({
  open,
  onOpenChange,
  onSelect,
}: CustomerSelectDialogProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>("erp");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: erpCustomers = [], isLoading: erpLoading } = useErpCustomers(null);
  const {
    data: crmCustomersData,
    isLoading: crmLoading,
    fetchNextPage: fetchNextCrmPage,
    hasNextPage: hasNextCrmPage,
    isFetchingNextPage: isFetchingNextCrmPage,
  } = useCustomers({
    pageSize: 20,
    sortBy: "name",
    sortDirection: "asc",
  });

  const crmCustomers = useMemo(() => {
    return crmCustomersData?.pages.flatMap((page) => page.items) || [];
  }, [crmCustomersData]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setActiveTab("erp");
    }
  }, [open]);

  const filteredErpCustomers = useMemo(() => {
    if (!searchQuery.trim()) return erpCustomers;
    const query = searchQuery.toLowerCase().trim();
    return erpCustomers.filter(
      (customer) =>
        customer.cariIsim?.toLowerCase().includes(query) ||
        customer.cariKod?.toLowerCase().includes(query)
    );
  }, [erpCustomers, searchQuery]);

  const filteredCrmCustomers = useMemo(() => {
    if (!searchQuery.trim()) return crmCustomers;
    const query = searchQuery.toLowerCase().trim();
    return crmCustomers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(query) ||
        customer.customerCode?.toLowerCase().includes(query)
    );
  }, [crmCustomers, searchQuery]);

  const combinedCustomers = useMemo(() => {
    const erp: CombinedCustomer[] = filteredErpCustomers.map((customer) => ({
      type: "erp",
      erpCode: customer.cariKod,
      name: customer.cariIsim || customer.cariKod || "",
      phone: customer.cariTel,
      email: customer.email,
      city: customer.cariIl,
      district: customer.cariIlce,
    }));

    const crm: CombinedCustomer[] = filteredCrmCustomers.map((customer) => ({
      type: "crm",
      id: customer.id,
      name: customer.name,
      customerCode: customer.customerCode,
      phone: customer.phone,
      email: customer.email,
      city: customer.cityName,
      district: customer.districtName,
    }));

    const all = [...erp, ...crm];
    return all.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [filteredErpCustomers, filteredCrmCustomers]);

  const displayCustomers = useMemo(() => {
    switch (activeTab) {
      case "erp":
        return filteredErpCustomers.map((customer) => ({
          type: "erp" as const,
          erpCode: customer.cariKod,
          name: customer.cariIsim || customer.cariKod || "",
          phone: customer.cariTel,
          email: customer.email,
          city: customer.cariIl,
          district: customer.cariIlce,
        }));
      case "crm":
        return filteredCrmCustomers.map((customer) => ({
          type: "crm" as const,
          id: customer.id,
          name: customer.name,
          customerCode: customer.customerCode,
          phone: customer.phone,
          email: customer.email,
          city: customer.cityName,
          district: customer.districtName,
        }));
      case "all":
        return combinedCustomers;
      default:
        return [];
    }
  }, [activeTab, filteredErpCustomers, filteredCrmCustomers, combinedCustomers]);

  const isLoading = erpLoading || crmLoading;

  const handleCustomerSelect = useCallback(
    (customer: CombinedCustomer) => {
      if (customer.type === "erp" && customer.erpCode) {
        onSelect({
          customerId: undefined,
          erpCustomerCode: customer.erpCode,
        });
      } else if (customer.type === "crm" && customer.id) {
        onSelect({
          customerId: customer.id,
          erpCustomerCode: undefined,
        });
      }
      onOpenChange(false);
    },
    [onSelect, onOpenChange]
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleEndReached = useCallback(() => {
    if ((activeTab === "crm" || activeTab === "all") && hasNextCrmPage && !isFetchingNextCrmPage) {
      fetchNextCrmPage();
    }
  }, [activeTab, hasNextCrmPage, isFetchingNextCrmPage, fetchNextCrmPage]);

  const renderCustomerCard = useCallback(
    ({ item }: { item: CombinedCustomer }) => (
      <CustomerCard customer={item} onPress={() => handleCustomerSelect(item)} colors={colors} />
    ),
    [handleCustomerSelect, colors]
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    let message = "";
    if (searchQuery.trim()) {
      message = t("common.noResults");
    } else {
      switch (activeTab) {
        case "erp":
          message = "ERP müşterisi bulunamadı";
          break;
        case "crm":
          message = "CRM müşterisi bulunamadı";
          break;
        case "all":
          message = "Müşteri bulunamadı";
          break;
      }
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{message}</Text>
      </View>
    );
  }, [isLoading, searchQuery, activeTab, colors, t]);

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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Müşteri Seç</Text>
              <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                Müşteri seçmek için bir tab seçin ve listeden müşteriyi seçin
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
              placeholder="İsim veya kod ile ara..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <VoiceSearchButton onResult={setSearchQuery} />
          </View>

          <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "erp" && [styles.activeTab, { backgroundColor: colors.accent }],
              ]}
              onPress={() => setActiveTab("erp")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === "erp" ? "#FFFFFF" : colors.textMuted },
                ]}
              >
                ERP Müşterisi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "crm" && [styles.activeTab, { backgroundColor: colors.accent }],
              ]}
              onPress={() => setActiveTab("crm")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === "crm" ? "#FFFFFF" : colors.textMuted },
                ]}
              >
                CRM Müşterileri
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "all" && [styles.activeTab, { backgroundColor: colors.accent }],
              ]}
              onPress={() => setActiveTab("all")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === "all" ? "#FFFFFF" : colors.textMuted },
                ]}
              >
                Tümü
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {t("common.loading")}
              </Text>
            </View>
          ) : displayCustomers.length === 0 ? (
            renderEmpty()
          ) : (
            <FlatList
              data={displayCustomers}
              renderItem={renderCustomerCard}
              keyExtractor={(item, index) =>
                `${item.type}-${item.id || item.erpCode || index}`
              }
              numColumns={1}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmpty}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                isFetchingNextCrmPage ? (
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

interface CustomerCardProps {
  customer: CombinedCustomer;
  onPress: () => void;
  colors: Record<string, string>;
}

function CustomerCard({ customer, onPress, colors }: CustomerCardProps): React.ReactElement {
  return (
    <TouchableOpacity
      style={[
        styles.customerCard,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                customer.type === "erp" ? "#3B82F6" + "20" : "#10B981" + "20",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: customer.type === "erp" ? "#3B82F6" : "#10B981",
              },
            ]}
          >
            {customer.type === "erp" ? "ERP" : "CRM"}
          </Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.customerCode, { color: colors.textMuted }]} numberOfLines={1}>
          {customer.customerCode || customer.erpCode || "-"}
        </Text>
        <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={2}>
          {customer.name}
        </Text>

        <View style={styles.contactInfo}>
          {customer.phone && (
            <View style={styles.contactRow}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={[styles.contactText, { color: colors.textSecondary }]} numberOfLines={1}>
                {customer.phone}
              </Text>
            </View>
          )}
          {customer.email && (
            <View style={styles.contactRow}>
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={[styles.contactText, { color: colors.textSecondary }]} numberOfLines={1}>
                {customer.email}
              </Text>
            </View>
          )}
          {(customer.city || customer.district) && (
            <View style={styles.contactRow}>
              <Text style={styles.contactIcon}>📍</Text>
              <Text style={[styles.contactText, { color: colors.textSecondary }]} numberOfLines={1}>
                {[customer.city, customer.district].filter(Boolean).join(", ") || "-"}
              </Text>
            </View>
          )}
        </View>
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  activeTab: {
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
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
    gap: 12,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  customerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  cardBody: {
    gap: 8,
  },
  customerCode: {
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  contactInfo: {
    gap: 6,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactIcon: {
    fontSize: 14,
    width: 20,
  },
  contactText: {
    fontSize: 13,
    flex: 1,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
