import React, { useCallback, useMemo, useState, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Platform, 
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Text,
  KeyboardAvoidingView
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient"; 
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";

import { useContacts } from "../hooks";
import { useCustomers } from "../../customer/hooks";
import { ContactListCard } from "../components/ContactListCard"; 
import { SearchInput } from "../components/SearchInput"; 
import { FilterCustomerDropdown } from "../components/FilterCustomerDropdown"; 
import type { ContactDto, PagedFilter } from "../types";

import { 
  ContactBookIcon, 
  AlertCircleIcon, 
  RefreshIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  FilterIcon,
  Cancel01Icon
} from "hugeicons-react-native";

export function ContactListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const isDark = themeMode === "dark";

  const BRAND_COLOR = "#db2777"; 
  const BRAND_COLOR_DARK = "#ec4899";

  const mainBg = isDark ? "#0c0516" : "#FAFAFA";
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.08)', 'transparent', 'rgba(249, 115, 22, 0.05)'] 
    : ['rgba(219, 39, 119, 0.05)', 'transparent', 'rgba(255, 240, 225, 0.3)']) as [string, string, ...string[]];

  const theme = {
    text: isDark ? "#FFFFFF" : "#0F172A",
    textMute: isDark ? "#94a3b8" : "#64748B",
    primary: isDark ? BRAND_COLOR_DARK : BRAND_COLOR,     
    surfaceBg: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderColor: isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(219, 39, 119, 0.2)',
    switchBg: isDark ? 'rgba(0,0,0,0.3)' : '#F1F5F9',
    activeSwitchBg: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(219, 39, 119, 0.1)',
    iconColor: isDark ? "#64748B" : "#94a3b8",
    filterBg: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
    filterText: isDark ? '#CBD5E1' : '#475569',
    modalBg: isDark ? '#1E293B' : '#FFFFFF', 
    error: "#EF4444"
  };

  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  
  const [appliedCustomerId, setAppliedCustomerId] = useState<number | null>(null);
  const [appliedContactType, setAppliedContactType] = useState<string>('all');
  
  const [tempCustomerId, setTempCustomerId] = useState<number | null>(null);
  const [tempContactType, setTempContactType] = useState<string>('all');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const { data: customersData } = useCustomers({ pageSize: 100 });
  const customersList = customersData?.pages?.flatMap(p => p.items) || [];

  const filters = useMemo(() => {
    const arr: PagedFilter[] = [];
    if (debouncedQuery.trim().length >= 2) {
      arr.push({ column: "fullName", operator: "contains", value: debouncedQuery.trim() });
      arr.push({ column: "customerName", operator: "contains", value: debouncedQuery.trim() });
    }
    if (appliedCustomerId) {
      arr.push({ column: "customerId", operator: "eq", value: String(appliedCustomerId) });
    }
    if (appliedContactType === 'hasPhone') {
      arr.push({ column: "phone", operator: "isNotNull", value: "" });
    } else if (appliedContactType === 'hasEmail') {
      arr.push({ column: "email", operator: "isNotNull", value: "" });
    }
    return arr.length > 0 ? arr : undefined;
  }, [debouncedQuery, appliedCustomerId, appliedContactType]);

  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } = useContacts({ 
    filters,
    sortBy: "fullName",
    sortDirection: sortOrder,
    filterLogic: debouncedQuery.trim().length >= 2 ? "or" : "and",
    pageSize: 20 
  });

  const contacts = useMemo(() => {
    const pages = data?.pages ?? [];
    return pages
      .flatMap((page) => {
        const pageData = page as unknown as { items?: ContactDto[]; Items?: ContactDto[] };
        if (Array.isArray(pageData.items)) return pageData.items;
        if (Array.isArray(pageData.Items)) return pageData.Items;
        return [];
      })
      .filter((item): item is ContactDto => item != null);
  }, [data]);

  const totalCount = data?.pages?.[0]?.totalCount || contacts.length || 0;
  const isInitialLoading = isPending && contacts.length === 0;
  const isAnyFilterActive = appliedCustomerId !== null || appliedContactType !== 'all';

  const handleContactPress = useCallback((contact: ContactDto) => {
      if (!contact?.id) return;
      router.push(`/customers/contacts/${contact.id}`);
    }, [router]);

  const handleCreatePress = useCallback(() => {
    router.push("/customers/contacts/create");
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const openFilterModal = () => {
    setTempCustomerId(appliedCustomerId);
    setTempContactType(appliedContactType);
    setIsCustomerDropdownOpen(false);
    setIsFilterModalVisible(true);
  };

  const applyFilters = () => {
    setAppliedCustomerId(tempCustomerId);
    setAppliedContactType(tempContactType);
    setIsFilterModalVisible(false);
  };

  const clearFilters = () => {
    setTempCustomerId(null);
    setTempContactType('all');
    setIsCustomerDropdownOpen(false);
  };

  const renderItem = useCallback(({ item }: { item: ContactDto }) => (
    <ContactListCard 
       contact={item} 
       onPress={() => handleContactPress(item)} 
    />
  ), [handleContactPress]);

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenHeader title={t("contact.title")} showBackButton />
        
        <View style={styles.content}> 
          
          <View style={styles.controlsArea}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <SearchInput value={searchText} onSearch={setSearchText} placeholder={t("contact.searchPlaceholder")} />
            </View>
            <TouchableOpacity 
              onPress={handleCreatePress} 
              style={[
                styles.iconBtn, 
                { 
                  backgroundColor: isDark ? "rgba(219, 39, 119, 0.15)" : theme.surfaceBg, 
                  borderColor: isDark ? "rgba(236, 72, 153, 0.3)" : theme.borderColor,
                  shadowOpacity: isDark ? 0 : 0.25,
                  elevation: isDark ? 0 : 3
                }
              ]} 
              activeOpacity={0.7}
            >
              <ContactBookIcon size={22} color={theme.primary} variant="stroke" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {(!isInitialLoading || data) && (
            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: theme.textMute }]}>
                {totalCount} kişi bulundu
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={[styles.sortBtn, { marginRight: 12, position: 'relative' }]} onPress={openFilterModal}>
                  <Text style={[styles.sortText, { color: isAnyFilterActive ? theme.primary : theme.textMute }]}>
                    Filtrele
                  </Text>
                  <FilterIcon size={16} color={isAnyFilterActive ? theme.primary : theme.textMute} strokeWidth={2.5} style={{ marginLeft: 4 }} />
                  {isAnyFilterActive && <View style={[styles.activeFilterDot, { backgroundColor: theme.primary }]} />}
                </TouchableOpacity>

                <TouchableOpacity style={styles.sortBtn} onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                  <Text style={[styles.sortText, { color: theme.primary }]}>
                    {sortOrder === 'desc' ? 'Z - A' : 'A - Z'}
                  </Text>
                  {sortOrder === 'desc' ? (
                    <ArrowDown01Icon size={16} color={theme.primary} strokeWidth={2.5} style={{ marginLeft: 4 }} />
                  ) : (
                    <ArrowUp01Icon size={16} color={theme.primary} strokeWidth={2.5} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isInitialLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : isError ? (
            <View style={styles.centerContainer}>
               <AlertCircleIcon size={48} color={theme.textMute} variant="stroke" />
              <Text style={[styles.errorText, { color: theme.error }]}>{t("common.error")}</Text>
              <TouchableOpacity onPress={() => refetch()} style={[styles.retryButton, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" }]}>
                <RefreshIcon size={16} color={theme.text} variant="stroke" />
                <Text style={[styles.retryText, { color: theme.text }]}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={contacts}
              renderItem={renderItem}
              keyExtractor={(item, index) => String(item.id ?? index)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 4, 
                  paddingBottom: insets.bottom + 100,
              }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5} 
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View style={{ paddingVertical: 20 }}><ActivityIndicator size="small" color={theme.primary} /></View>
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={{ fontSize: 40, opacity: 0.8 }}>📇</Text>
                  <Text style={[styles.emptyText, { color: theme.textMute }]}>{t("contact.noContacts")}</Text>
                </View>
              }
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <KeyboardAvoidingView 
           style={{ flex: 1 }} 
           behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
        >
          <View style={styles.modalOverlay}>
            
            <TouchableWithoutFeedback onPress={() => setIsFilterModalVisible(false)}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>

            <View style={[styles.modalContent, { backgroundColor: theme.modalBg, paddingBottom: Platform.OS === 'ios' ? insets.bottom + 20 : 20, maxHeight: '85%' }]}>
              
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.primary }]}>Filtreler</Text>
                <TouchableOpacity onPress={() => setIsFilterModalVisible(false)} style={styles.closeBtn}>
                  <Cancel01Icon size={24} color={theme.textMute} variant="stroke" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={[styles.modalLabel, { color: theme.textMute }]}>İletişim Bilgisi</Text>
                <View style={styles.wrapContainer}>
                  {[
                    { id: 'all', label: 'Tümü' },
                    { id: 'hasPhone', label: 'Telefonu Olanlar' },
                    { id: 'hasEmail', label: 'E-Postası Olanlar' }
                  ].map(filter => (
                    <TouchableOpacity
                      key={filter.id}
                      style={[styles.filterPill, { backgroundColor: theme.filterBg }, tempContactType === filter.id && { backgroundColor: theme.activeSwitchBg, borderColor: theme.borderColor, borderWidth: 1 }]}
                      onPress={() => setTempContactType(filter.id)} 
                    >
                      <Text style={[styles.filterPillText, { color: theme.filterText }, tempContactType === filter.id && { color: theme.primary }]}>{filter.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.modalLabel, { color: theme.textMute, marginTop: 24 }]}>Şirket Seçimi</Text>
                <FilterCustomerDropdown 
                  customers={customersList}
                  selectedId={tempCustomerId}
                  onSelect={setTempCustomerId}
                  isOpen={isCustomerDropdownOpen}
                  onToggle={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                />

                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={[styles.modalActionBtn, { backgroundColor: theme.switchBg, flex: 1, marginRight: 10 }]} 
                    onPress={clearFilters}
                  >
                    <Text style={[styles.modalActionText, { color: theme.textMute }]}>Temizle</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalActionBtn, { backgroundColor: theme.primary, flex: 2 }]} 
                    onPress={applyFilters}
                  >
                    <Text style={[styles.modalActionText, { color: '#FFF' }]}>Uygula</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, backgroundColor: 'transparent' },
  
  controlsArea: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 8 
  },
  iconBtn: { 
    height: 48, 
    width: 48, 
    borderRadius: 14, 
    borderWidth: 1.5, 
    alignItems: 'center', 
    justifyContent: 'center',
    overflow: 'hidden' 
  },

  metaRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 18, 
    paddingBottom: 10 
  },
  metaText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingLeft: 8 },
  sortText: { fontSize: 12, fontWeight: '700' },
  activeFilterDot: { position: 'absolute', top: 2, right: -4, width: 6, height: 6, borderRadius: 3 },

  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 20 },
  errorText: { fontSize: 16, marginTop: 12 },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  retryText: { fontSize: 15, fontWeight: "700" },
  
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyText: { fontSize: 15, marginTop: 12, fontWeight: '500', letterSpacing: 0.5, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  closeBtn: { padding: 4 },
  modalLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  wrapContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  filterPillText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },

  modalFooter: { flexDirection: 'row', marginTop: 30 },
  modalActionBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalActionText: { fontSize: 15, fontWeight: '700' }
});