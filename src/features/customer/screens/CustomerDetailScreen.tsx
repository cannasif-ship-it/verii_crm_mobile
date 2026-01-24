import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import {
  useCustomer,
  useDeleteCustomer,
  useCustomerContacts,
  useCustomerShippingAddresses,
} from "../hooks";
import { ContactCard } from "../components/ContactCard";
import { ShippingAddressCard } from "../components/ShippingAddressCard";
import type { ContactDto, ShippingAddressDto } from "../types";

type TabType = "detail" | "contacts" | "addresses";

interface DetailRowProps {
  label: string;
  value: string | undefined | null;
  colors: ReturnType<typeof useUIStore>["colors"];
}

function DetailRow({ label, value, colors }: DetailRowProps): React.ReactElement | null {
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

interface TabBarProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
  colors: ReturnType<typeof useUIStore>["colors"];
  t: (key: string) => string;
  contactsCount: number;
  addressesCount: number;
}

function TabBar({
  activeTab,
  onTabPress,
  colors,
  t,
  contactsCount,
  addressesCount,
}: TabBarProps): React.ReactElement {
  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: "detail", label: t("customer.tabDetail") },
    { key: "contacts", label: t("customer.tabContacts"), count: contactsCount },
    { key: "addresses", label: t("customer.tabShippingAddresses"), count: addressesCount },
  ];

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
          ]}
          onPress={() => onTabPress(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === tab.key ? colors.accent : colors.textMuted },
            ]}
          >
            {tab.label}
          </Text>
          {tab.count !== undefined && tab.count > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.tabBadgeText}>{tab.count}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
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

export function CustomerDetailScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("detail");

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const customerId = id ? Number(id) : undefined;
  const { data: customer, isLoading, isError, refetch } = useCustomer(customerId);
  const deleteCustomer = useDeleteCustomer();
  const { data: contacts = [], isLoading: isLoadingContacts } = useCustomerContacts(customerId);
  const { data: addresses = [], isLoading: isLoadingAddresses } = useCustomerShippingAddresses(customerId);

  const handleEditPress = useCallback(() => {
    if (customer) {
      router.push(`/(tabs)/customers/edit/${customer.id}`);
    }
  }, [router, customer]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(t("common.confirm"), t("customer.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (!customerId) return;
          setIsDeleting(true);
          try {
            await deleteCustomer.mutateAsync(customerId);
            router.back();
          } catch {
            Alert.alert(t("common.error"), t("common.error"));
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }, [t, customerId, deleteCustomer, router]);

  const handleContactPress = useCallback(
    (contact: ContactDto) => {
      router.push(`/(tabs)/customers/contacts/${contact.id}`);
    },
    [router]
  );

  const handleAddressPress = useCallback(
    (address: ShippingAddressDto) => {
      router.push(`/(tabs)/customers/shipping/${address.id}`);
    },
    [router]
  );

  const handleAddContactPress = useCallback(() => {
    router.push({
      pathname: "/(tabs)/customers/contacts/create",
      params: { customerId: customerId?.toString() },
    });
  }, [router, customerId]);

  const handleAddAddressPress = useCallback(() => {
    router.push({
      pathname: "/(tabs)/customers/shipping/create",
      params: { customerId: customerId?.toString() },
    });
  }, [router, customerId]);

  const renderContactItem = useCallback(
    ({ item }: { item: ContactDto }) => (
      <ContactCard contact={item} onPress={() => handleContactPress(item)} />
    ),
    [handleContactPress]
  );

  const renderAddressItem = useCallback(
    ({ item }: { item: ShippingAddressDto }) => (
      <ShippingAddressCard address={item} onPress={() => handleAddressPress(item)} />
    ),
    [handleAddressPress]
  );

  const keyExtractorContact = useCallback((item: ContactDto) => String(item.id), []);
  const keyExtractorAddress = useCallback((item: ShippingAddressDto) => String(item.id), []);

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

  const renderDetailContent = (): React.ReactElement => (
    <ScrollView
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
    </ScrollView>
  );

  const renderContactsContent = (): React.ReactElement => (
    <View style={styles.tabContent}>
      {isLoadingContacts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("contact.noContacts")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={keyExtractorContact}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={handleAddContactPress}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddressesContent = (): React.ReactElement => (
    <View style={styles.tabContent}>
      {isLoadingAddresses ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("shippingAddress.noAddresses")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={keyExtractorAddress}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={handleAddAddressPress}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = (): React.ReactElement => {
    switch (activeTab) {
      case "contacts":
        return renderContactsContent();
      case "addresses":
        return renderAddressesContent();
      default:
        return renderDetailContent();
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={t("customer.detail")}
          showBackButton
          rightContent={
            customer ? (
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleEditPress} style={styles.headerButton}>
                  <Text style={styles.headerButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeletePress}
                  style={styles.headerButton}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.headerButtonText}>🗑️</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : undefined
          }
        />
        <View style={[styles.content, { backgroundColor: contentBackground }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>{t("common.error")}</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: colors.accent }]}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : customer ? (
            <>
              <TabBar
                activeTab={activeTab}
                onTabPress={setActiveTab}
                colors={colors}
                t={t}
                contactsCount={contacts.length}
                addressesCount={addresses.length}
              />
              {renderTabContent()}
            </>
          ) : null}
        </View>
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
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tabContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  listContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: {
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
