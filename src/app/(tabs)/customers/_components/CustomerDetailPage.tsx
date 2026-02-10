import React, { useCallback, useState } from "react";
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
import { ScreenHeader } from "../../../../components/navigation";
import { Text } from "../../../../components/ui/text";
import { useUIStore } from "../../../../store/ui";
import {
  useCustomer,
  useDeleteCustomer,
  CustomerDetailContent,
} from "../../../../features/customer";
import {
  useCustomerContacts,
  ContactCard,
  type ContactDto,
} from "../../../../features/contact";
import {
  useCustomerShippingAddresses,
  ShippingAddressCard,
  type ShippingAddressDto,
} from "../../../../features/shipping-address";
// HugeIcons
import { 
  Edit02Icon, 
  Delete02Icon, 
  Add01Icon, 
  Analytics02Icon 
} from "hugeicons-react-native";

type TabType = "detail" | "contacts" | "addresses";

// --- TEMA ARAYÜZÜ ---
interface ThemeColors {
  bg: string;
  primary: string;
  text: string;
  textMute: string;
  borderColor: string;
  glassBtn: string;
  danger: string;
  tabActiveBg: string; // Tab aktifken arka planı (opsiyonel)
}

interface TabBarProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
  theme: ThemeColors; // Temayı prop olarak geçiyoruz
  t: (key: string) => string;
  contactsCount: number;
  addressesCount: number;
}

function TabBar({
  activeTab,
  onTabPress,
  theme,
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
    <View style={[styles.tabBar, { borderBottomColor: theme.borderColor }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && { borderBottomColor: theme.primary, borderBottomWidth: 3 },
            ]}
            onPress={() => onTabPress(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                { 
                  color: isActive ? theme.text : theme.textMute, 
                  fontWeight: isActive ? "700" : "500" 
                },
              ]}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && tab.count > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: isActive ? theme.primary : theme.glassBtn }]}>
                <Text style={styles.tabBadgeText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CustomerDetailPage(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // --- DİNAMİK TEMA ---
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  const isDark = themeMode === "dark";

  // Renkleri moda göre seçiyoruz
  const THEME: ThemeColors = {
    bg: isDark ? "#1a0b2e" : colors.background, // Koyu mor veya Beyaz
    primary: "#db2777", // Neon Pembe (Vurgu rengi her iki modda da aynı kalabilir)
    text: isDark ? "#FFFFFF" : colors.text,
    textMute: isDark ? "#94a3b8" : colors.textMuted,
    borderColor: isDark ? "rgba(255,255,255,0.08)" : colors.border,
    glassBtn: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    danger: "#ef4444",
    tabActiveBg: isDark ? "rgba(219, 39, 119, 0.1)" : "rgba(219, 39, 119, 0.05)",
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("detail");

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

  const handleCustomer360Press = useCallback(() => {
    if (customerId) {
      router.push(`/(tabs)/customers/360/${customerId}`);
    }
  }, [router, customerId]);

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

  const handleContactPress = useCallback((contact: ContactDto) => {
      router.push(`/(tabs)/customers/contacts/${contact.id}`);
    }, [router]);

  const handleAddressPress = useCallback((address: ShippingAddressDto) => {
      router.push(`/(tabs)/customers/shipping/${address.id}`);
    }, [router]);

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

  const renderContactItem = useCallback(({ item }: { item: ContactDto }) => (
      <ContactCard contact={item} onPress={() => handleContactPress(item)} />
    ), [handleContactPress]);

  const renderAddressItem = useCallback(({ item }: { item: ShippingAddressDto }) => (
      <ShippingAddressCard address={item} onPress={() => handleAddressPress(item)} />
    ), [handleAddressPress]);

  const keyExtractorContact = useCallback((item: ContactDto) => String(item.id), []);
  const keyExtractorAddress = useCallback((item: ShippingAddressDto) => String(item.id), []);

  const renderContactsContent = (): React.ReactElement => (
    <View style={styles.tabContent}>
      {isLoadingContacts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: THEME.textMute }]}>
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
        style={[styles.fab, { backgroundColor: THEME.primary }]}
        onPress={handleAddContactPress}
      >
        <Add01Icon size={28} color="#FFFFFF" variant="stroke" />
      </TouchableOpacity>
    </View>
  );

  const renderAddressesContent = (): React.ReactElement => (
    <View style={styles.tabContent}>
      {isLoadingAddresses ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: THEME.textMute }]}>
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
        style={[styles.fab, { backgroundColor: THEME.primary }]}
        onPress={handleAddAddressPress}
      >
        <Add01Icon size={28} color="#FFFFFF" variant="stroke" />
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
        return (
          <CustomerDetailContent
            customer={customer}
            colors={colors} // Detay içeriği kendi içinde temayı halledebilir veya buradan alabilir
            insets={insets}
            t={t}
          />
        );
    }
  };

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={THEME.bg} />
      
      <View style={[styles.container, { backgroundColor: THEME.bg }]}>
        
        {/* HEADER BÖLÜMÜ */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: THEME.borderColor }}>
            <ScreenHeader
            title={t("customer.detail")}
            showBackButton
            // ScreenHeader içinde tema desteği yoksa style prop ile geçmek gerekebilir
            // style={{ backgroundColor: THEME.bg }} 
            rightElement={
                customer ? (
                <View style={styles.headerActions}>
                    {/* --- 360 GÖRÜNÜM BUTONU --- */}
                    <TouchableOpacity onPress={handleCustomer360Press} style={[styles.headerButton, { backgroundColor: THEME.glassBtn }]}>
                       <Analytics02Icon size={20} color={THEME.text} variant="stroke" />
                    </TouchableOpacity>
                    
                    {/* Düzenle Butonu */}
                    <TouchableOpacity onPress={handleEditPress} style={[styles.headerButton, { backgroundColor: THEME.glassBtn }]}>
                       <Edit02Icon size={20} color={THEME.text} variant="stroke" />
                    </TouchableOpacity>
                    
                    {/* Sil Butonu */}
                    <TouchableOpacity
                        onPress={handleDeletePress}
                        style={[styles.headerButton, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}
                        disabled={isDeleting}
                    >
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Delete02Icon size={20} color={THEME.danger} variant="stroke" />
                    )}
                    </TouchableOpacity>
                </View>
                ) : undefined
            }
            />
        </View>

        <View style={[styles.content, { backgroundColor: THEME.bg }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: THEME.danger }]}>{t("common.error")}</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: THEME.primary }]}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : customer ? (
            <>
              {/* TAB BAR */}
              <TabBar
                activeTab={activeTab}
                onTabPress={setActiveTab}
                theme={THEME} // Temayı TabBar'a iletiyoruz
                t={t}
                contactsCount={contacts.length}
                addressesCount={addresses.length}
              />
              
              {/* İÇERİK */}
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
  },
  // --- TAB BAR ---
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
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
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // ----------------
  tabContent: {
    flex: 1,
  },
  listContent: {
    padding: 16,
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
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: {
    fontSize: 14, 
    color: "#FFF",
    fontWeight: "600"
  },
});

export default CustomerDetailPage;