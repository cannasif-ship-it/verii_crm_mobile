import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  ScrollView,
  Modal, 
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useCustomers, useCities, useDistricts } from "../hooks"; 
import type { CustomerDto, PagedFilter } from "../types"; 

import { SearchInput } from "../components/SearchInput"; 
import { 
  LayoutGridIcon, 
  ListViewIcon, 
  AddTeamIcon,
  ArrowDown01Icon, 
  ArrowUp01Icon,
  FilterIcon, 
  Cancel01Icon 
} from "hugeicons-react-native"; 
import { CustomerCard } from "../components/CustomerCard"; 

const { width } = Dimensions.get('window');
const GAP = 12; 
const PADDING = 16; 
const GRID_WIDTH = (width - (PADDING * 2) - GAP) / 2;

const BRAND_COLOR = "#db2777"; 
const BRAND_COLOR_DARK = "#ec4899";
const DEFAULT_COUNTRY_ID = 1;

export function CustomerListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const mainBg = isDark ? "#0c0516" : "#FAFAFA";
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.08)', 'transparent', 'rgba(249, 115, 22, 0.05)'] 
    : ['rgba(219, 39, 119, 0.05)', 'transparent', 'rgba(255, 240, 225, 0.3)']) as [string, string, ...string[]];

  const theme = {
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
  };
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // ASIL FİLTRELER
  const [appliedFilter, setAppliedFilter] = useState<string>('all'); 
  const [appliedCityId, setAppliedCityId] = useState<number | null>(null); 
  const [appliedDistrictId, setAppliedDistrictId] = useState<number | null>(null); 

  // GEÇİCİ FİLTRELER
  const [tempFilter, setTempFilter] = useState<string>('all'); 
  const [tempCityId, setTempCityId] = useState<number | null>(null); 
  const [tempDistrictId, setTempDistrictId] = useState<number | null>(null);

  // YENİ: Custom Dropdown Açık/Kapalı Durumları
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const openFilterModal = () => {
    setTempFilter(appliedFilter);
    setTempCityId(appliedCityId);
    setTempDistrictId(appliedDistrictId);
    setIsCityDropdownOpen(false); // Modal açılırken kapalı başlasın
    setIsDistrictDropdownOpen(false);
    setIsFilterModalVisible(true);
  };

  const apiFilters = useMemo(() => {
    const filters: PagedFilter[] = [];
    if (debouncedQuery && debouncedQuery.trim().length >= 2) {
      filters.push({ column: "Name", operator: "contains", value: debouncedQuery.trim() });
    }
    if (appliedFilter === 'erp_yes') {
      filters.push({ column: "IsERPIntegrated", operator: "eq", value: "true" });
    }
    if (appliedCityId) {
      filters.push({ column: "CityId", operator: "eq", value: String(appliedCityId) });
    }
    if (appliedDistrictId) {
      filters.push({ column: "DistrictId", operator: "eq", value: String(appliedDistrictId) });
    }
    return filters;
  }, [debouncedQuery, appliedFilter, appliedCityId, appliedDistrictId]);

  const { 
    data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage
  } = useCustomers({ 
    filters: apiFilters,
    sortBy: "Id",
    sortDirection: sortOrder,
    pageSize: 20
  }); 

  // LOOKUP VERİLERİ
  const { data: cities } = useCities(DEFAULT_COUNTRY_ID);
  const { data: tempDistricts } = useDistricts(tempCityId || undefined); 

  const customers = useMemo(() => {
    return data?.pages?.flatMap(page => page.items ?? []) || [];
  }, [data]);

  const totalCount = data?.pages?.[0]?.totalCount || 0;

  const loadMoreData = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleCreatePress = () => {
    router.push("/customers/create");
  };

  const renderItem = useCallback(({ item }: { item: CustomerDto }) => (
    <View style={viewMode === 'grid' ? { width: GRID_WIDTH } : { width: '100%' }}>
        <CustomerCard customer={item} viewMode={viewMode} onPress={() => router.push(`/customers/${item.id}`)} />
    </View>
  ), [viewMode, router]);

  const isAnyFilterActive = appliedFilter !== 'all' || appliedCityId !== null || appliedDistrictId !== null;
  
  // Dropdown'da gösterilecek seçili isimler
  const tempSelectedCityName = cities?.find(c => c.id === tempCityId)?.name || "Tüm İller";
  const tempSelectedDistrictName = tempDistricts?.find(d => d.id === tempDistrictId)?.name || "Tüm İlçeler";

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </View>

      <View style={{ flex: 1 }}>
        <ScreenHeader title={t("customer.title")} showBackButton={true} />

        <View style={styles.contentContainer}>
          
          <View style={styles.controlsArea}>
            <View style={{ flex: 1, marginRight: 10 }}>
               <SearchInput value={searchText} onSearch={setSearchText} placeholder={t("customer.search")} />
            </View>
            <TouchableOpacity onPress={handleCreatePress} style={[styles.iconBtn, { backgroundColor: theme.surfaceBg, borderColor: theme.borderColor, marginRight: 8 }]} activeOpacity={0.7}>
              <AddTeamIcon size={22} color={theme.primary} variant="stroke" strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={[styles.viewSwitcher, { backgroundColor: theme.switchBg }]}>
              <TouchableWithoutFeedback onPress={() => setViewMode('grid')}>
                <View style={[styles.switchBtn, viewMode === 'grid' && { backgroundColor: theme.activeSwitchBg }]}>
                   <LayoutGridIcon size={20} color={viewMode === 'grid' ? theme.primary : theme.iconColor} variant="stroke" strokeWidth={viewMode === 'grid' ? 2.5 : 1.5} />
                </View>
              </TouchableWithoutFeedback>
              
              <TouchableWithoutFeedback onPress={() => setViewMode('list')}>
                <View style={[styles.switchBtn, viewMode === 'list' && { backgroundColor: theme.activeSwitchBg }]}>
                   <ListViewIcon size={20} color={viewMode === 'list' ? theme.primary : theme.iconColor} variant="stroke" strokeWidth={viewMode === 'list' ? 2.5 : 1.5} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>

          {(!isLoading || data) && (
            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: theme.textMute }]}>
                {totalCount} müşteri bulundu
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
                    {sortOrder === 'desc' ? 'En Yeniler' : 'En Eskiler'}
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

          {isLoading && !data ? (
            <View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /></View>
          ) : (
            <FlatList
              key={viewMode} 
              data={customers}
              renderItem={renderItem}
              keyExtractor={(item) => String(item.id)}
              numColumns={viewMode === 'grid' ? 2 : 1}
              columnWrapperStyle={viewMode === 'grid' ? { gap: GAP } : undefined}
              contentContainerStyle={{
                  paddingHorizontal: viewMode === 'grid' ? PADDING : 16,
                  paddingTop: 4, 
                  paddingBottom: insets.bottom + 100,
                  gap: viewMode === 'grid' ? GAP : 0, 
              }}
              onEndReached={loadMoreData}
              onEndReachedThreshold={0.3}
              ListFooterComponent={isFetchingNextPage ? <View style={{ paddingVertical: 20 }}><ActivityIndicator size="small" color={theme.primary} /></View> : null}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              ListEmptyComponent={
                <View style={styles.center}>
                  <Text style={{ fontSize: 40, opacity: 0.8 }}>📍</Text>
                  <Text style={{ color: theme.textMute, marginTop: 12, fontWeight: '500', letterSpacing: 0.5, textAlign: 'center' }}>
                    Kriterlere uygun müşteri bulunamadı.{"\n"}Filtreleri temizlemeyi deneyin.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>

      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBg, paddingBottom: insets.bottom + 20 }]}>
            
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.primary }]}>Filtreler</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)} style={styles.closeBtn}>
                <Cancel01Icon size={24} color={theme.textMute} variant="stroke" />
              </TouchableOpacity>
            </View>

            {/* BÖLÜM 1: MÜŞTERİ DURUMU (Hap Tasarımı - Sadece 2 seçenek var diye burada kaldı) */}
            <Text style={[styles.modalLabel, { color: theme.textMute }]}>Müşteri Durumu</Text>
            <View style={styles.wrapContainer}>
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'erp_yes', label: 'Sadece ERP Entegre Olanlar' }
              ].map(filter => (
                <TouchableOpacity
                  key={filter.id}
                  style={[styles.filterPill, { backgroundColor: theme.filterBg }, tempFilter === filter.id && { backgroundColor: theme.activeSwitchBg, borderColor: theme.borderColor, borderWidth: 1 }]}
                  onPress={() => setTempFilter(filter.id)} 
                >
                  <Text style={[styles.filterPillText, { color: theme.filterText }, tempFilter === filter.id && { color: theme.primary }]}>{filter.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* BÖLÜM 2: YENİ NESİL İL SEÇİMİ (Zarif Dropdown) */}
            <Text style={[styles.modalLabel, { color: theme.textMute, marginTop: 24 }]}>İl Seçimi</Text>
            <TouchableOpacity 
              style={[styles.dropdownBtn, { backgroundColor: theme.filterBg, borderColor: isCityDropdownOpen ? theme.primary : 'transparent' }]}
              onPress={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownBtnText, { color: tempCityId ? theme.primary : theme.filterText, fontWeight: tempCityId ? '700' : '500' }]}>
                {tempSelectedCityName}
              </Text>
              <ArrowDown01Icon size={20} color={tempCityId ? theme.primary : theme.textMute} style={{ transform: [{ rotate: isCityDropdownOpen ? '180deg' : '0deg' }] }} />
            </TouchableOpacity>

            {/* İl Dropdown Listesi */}
            {isCityDropdownOpen && (
              <View style={[styles.dropdownListContainer, { backgroundColor: theme.surfaceBg, borderColor: theme.borderColor }]}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                  <TouchableOpacity 
                    style={[styles.dropdownItem, { borderBottomColor: theme.borderColor }]} 
                    onPress={() => { setTempCityId(null); setTempDistrictId(null); setIsCityDropdownOpen(false); }}
                  >
                    <Text style={[styles.dropdownItemText, { color: !tempCityId ? theme.primary : theme.textMute, fontWeight: !tempCityId ? '700' : '500' }]}>Tüm İller</Text>
                  </TouchableOpacity>
                  
                  {cities?.map(city => (
                    <TouchableOpacity 
                      key={city.id} 
                      style={[styles.dropdownItem, { borderBottomColor: theme.borderColor }]} 
                      onPress={() => { setTempCityId(city.id); setTempDistrictId(null); setIsCityDropdownOpen(false); }}
                    >
                      <Text style={[styles.dropdownItemText, { color: tempCityId === city.id ? theme.primary : theme.textMute, fontWeight: tempCityId === city.id ? '700' : '500' }]}>
                        {city.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* BÖLÜM 3: YENİ NESİL İLÇE SEÇİMİ (Sadece İl Seçiliyse Açılır) */}
            {tempCityId && tempDistricts && tempDistricts.length > 0 && (
              <>
                <Text style={[styles.modalLabel, { color: theme.textMute, marginTop: 16 }]}>İlçe Seçimi</Text>
                <TouchableOpacity 
                  style={[styles.dropdownBtn, { backgroundColor: theme.filterBg, borderColor: isDistrictDropdownOpen ? theme.primary : 'transparent' }]}
                  onPress={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownBtnText, { color: tempDistrictId ? theme.primary : theme.filterText, fontWeight: tempDistrictId ? '700' : '500' }]}>
                    {tempSelectedDistrictName}
                  </Text>
                  <ArrowDown01Icon size={20} color={tempDistrictId ? theme.primary : theme.textMute} style={{ transform: [{ rotate: isDistrictDropdownOpen ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {/* İlçe Dropdown Listesi */}
                {isDistrictDropdownOpen && (
                  <View style={[styles.dropdownListContainer, { backgroundColor: theme.surfaceBg, borderColor: theme.borderColor }]}>
                    <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                      <TouchableOpacity 
                        style={[styles.dropdownItem, { borderBottomColor: theme.borderColor }]} 
                        onPress={() => { setTempDistrictId(null); setIsDistrictDropdownOpen(false); }}
                      >
                        <Text style={[styles.dropdownItemText, { color: !tempDistrictId ? theme.primary : theme.textMute, fontWeight: !tempDistrictId ? '700' : '500' }]}>Tüm İlçeler</Text>
                      </TouchableOpacity>

                      {tempDistricts.map(district => (
                        <TouchableOpacity 
                          key={district.id} 
                          style={[styles.dropdownItem, { borderBottomColor: theme.borderColor }]} 
                          onPress={() => { setTempDistrictId(district.id); setIsDistrictDropdownOpen(false); }}
                        >
                          <Text style={[styles.dropdownItemText, { color: tempDistrictId === district.id ? theme.primary : theme.textMute, fontWeight: tempDistrictId === district.id ? '700' : '500' }]}>
                            {district.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalActionBtn, { backgroundColor: theme.switchBg, flex: 1, marginRight: 10 }]} 
                onPress={() => { 
                  setTempFilter('all'); 
                  setTempCityId(null); 
                  setTempDistrictId(null); 
                  setIsCityDropdownOpen(false);
                  setIsDistrictDropdownOpen(false);
                }}
              >
                <Text style={[styles.modalActionText, { color: theme.textMute }]}>Temizle</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalActionBtn, { backgroundColor: theme.primary, flex: 2 }]} 
                onPress={() => {
                  setAppliedFilter(tempFilter);
                  setAppliedCityId(tempCityId);
                  setAppliedDistrictId(tempDistrictId);
                  setIsFilterModalVisible(false);
                }}
              >
                <Text style={[styles.modalActionText, { color: '#FFF' }]}>Uygula</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 60 },
  
  controlsArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  iconBtn: { height: 50, width: 50, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', shadowColor: "#db2777", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 3 },
  viewSwitcher: { flexDirection: 'row', padding: 4, borderRadius: 14, alignItems: 'center', height: 50, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.1)' },
  switchBtn: { borderRadius: 10, height: 40, width: 40, alignItems: 'center', justifyContent: 'center' },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 8 },
  metaText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingLeft: 8 },
  sortText: { fontSize: 12, fontWeight: '700' },
  activeFilterDot: { position: 'absolute', top: 2, right: -4, width: 6, height: 6, borderRadius: 3 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  closeBtn: { padding: 4 },
  modalLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  wrapContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  filterPillText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },

  // --- YENİ EKLENEN CUSTOM DROPDOWN STİLLERİ ---
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dropdownBtnText: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  dropdownListContainer: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },

  modalFooter: { flexDirection: 'row', marginTop: 30 },
  modalActionBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalActionText: { fontSize: 15, fontWeight: '700' }
});