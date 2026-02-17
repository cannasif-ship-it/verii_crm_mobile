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
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Güvenli alan için

import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useCustomers } from "../hooks"; 
import { SearchInput } from "../components/SearchInput"; 
import { LayoutGridIcon, ListViewIcon, Add01Icon } from "hugeicons-react-native"; 
import type { CustomerDto } from "../types"; 
import { CustomerCard } from "../components/CustomerCard"; 

// --- SABİT DEĞERLER ---
const { width } = Dimensions.get('window');
const GAP = 12; 
const PADDING = 16; 
// Grid genişliği hesaplaması (Kartın içinde de kullanılıyor ama burada wrapper için lazım)
const GRID_WIDTH = (width - (PADDING * 2) - GAP) / 2;

// Tema Renkleri (Diğer dosyalarla uyumlu)
const BRAND_COLOR = "#db2777"; 
const BRAND_COLOR_DARK = "#ec4899";

export function CustomerListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  // --- ARKA PLAN & GRADIENT ---
  const mainBg = isDark ? "#0c0516" : "#FFFFFF";
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.12)', 'transparent', 'rgba(249, 115, 22, 0.12)'] 
    : ['rgba(255, 235, 240, 0.6)', '#FFFFFF', 'rgba(255, 240, 225, 0.6)']) as [string, string, ...string[]];

  // Lokal Tema
  const theme = {
    textMute: isDark ? "#94a3b8" : "#64748B",
    primary: isDark ? BRAND_COLOR_DARK : BRAND_COLOR,     
    activeSwitch: isDark ? BRAND_COLOR_DARK : BRAND_COLOR,
    switchBg: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
    iconColor: isDark ? "#FFF" : "#475569",
  };
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Arama Debounce (Gecikme)
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Veri Çekme
  const { 
    data, 
    isLoading, 
    refetch, 
    isRefetching 
  } = useCustomers({ pageSize: 1000 }); 

  // Filtreleme (Memoize edilmiş)
  const customers = useMemo(() => {
    const allCustomers = data?.pages?.flatMap(page => page.items ?? []) || [];
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      return allCustomers;
    }
    const lowerText = debouncedQuery.toLowerCase();
    return allCustomers.filter((item: CustomerDto) => {
      const nameMatch = item.name?.toLowerCase().includes(lowerText);
      const codeMatch = item.customerCode?.toLowerCase().includes(lowerText);
      return nameMatch || codeMatch;
    });
  }, [data, debouncedQuery]);

  const handleCreatePress = () => {
    router.push("/customers/create");
  };

  // Render Item
  const renderItem = useCallback(({ item }: { item: CustomerDto }) => (
    // Wrapper View: Grid modunda genişliği sınırlar, List modunda tam genişlik
    <View style={viewMode === 'grid' ? { width: GRID_WIDTH } : { width: '100%' }}>
        <CustomerCard 
          customer={item} 
          viewMode={viewMode}
          onPress={() => router.push(`/customers/${item.id}`)}
        />
    </View>
  ), [viewMode, router]);

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* KATMAN 1: Ambient Gradient */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* KATMAN 2: İçerik */}
      <View style={{ flex: 1 }}>
        <ScreenHeader title={t("customer.title")} showBackButton={true} />

        <View style={styles.contentContainer}>
          
          {/* KONTROL ALANI (Arama + Ekle + Görünüm) */}
          <View style={styles.controlsArea}>
            {/* Arama Çubuğu */}
            <View style={{ flex: 1, marginRight: 10 }}>
               <SearchInput 
                 value={searchText} 
                 onSearch={setSearchText} 
                 placeholder={t("customer.search")} 
               />
            </View>
            
            {/* Yeni Ekle Butonu */}
            <TouchableOpacity
              onPress={handleCreatePress}
              style={[styles.iconBtn, { backgroundColor: theme.primary, marginRight: 8 }]}
              activeOpacity={0.8}
            >
              <Add01Icon size={20} color="#FFF" variant="stroke" strokeWidth={2.5} />
            </TouchableOpacity>

            {/* Görünüm Değiştirici */}
            <View style={[styles.viewSwitcher, { backgroundColor: theme.switchBg }]}>
              <TouchableWithoutFeedback onPress={() => setViewMode('grid')}>
                <View style={[styles.switchBtn, viewMode === 'grid' && { backgroundColor: theme.activeSwitch }]}>
                   <LayoutGridIcon 
                    size={18} 
                    color={viewMode === 'grid' ? '#FFF' : theme.iconColor} 
                    variant="stroke" 
                   />
                </View>
              </TouchableWithoutFeedback>
              
              <TouchableWithoutFeedback onPress={() => setViewMode('list')}>
                <View style={[styles.switchBtn, viewMode === 'list' && { backgroundColor: theme.activeSwitch }]}>
                   <ListViewIcon 
                    size={18} 
                    color={viewMode === 'list' ? '#FFF' : theme.iconColor} 
                    variant="stroke" 
                   />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>

          {/* LİSTE ALANI */}
          {isLoading && !data ? (
            <View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /></View>
          ) : (
            <FlatList
              key={viewMode} // Mod değişince listeyi sıfırdan render et (Layout bozulmasını önler)
              data={customers}
              renderItem={renderItem}
              keyExtractor={(item) => String(item.id)}
              
              // GRID / LIST AYARLARI
              numColumns={viewMode === 'grid' ? 2 : 1}
              columnWrapperStyle={viewMode === 'grid' ? { gap: GAP } : undefined}
              
              contentContainerStyle={{
                  paddingHorizontal: viewMode === 'grid' ? PADDING : 16,
                  paddingTop: 8,
                  // Bottom Tab Bar'ın altında kalmaması için güvenli boşluk + ekstra pay
                  paddingBottom: insets.bottom + 100,
                  gap: viewMode === 'grid' ? GAP : 0, // List modunda gap 0, çünkü kartın kendi borderBottom'ı var
              }}
              
              // Performans Props
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              
              // Footer & Refresh
              refreshing={isRefetching}
              onRefresh={refetch}
              ListEmptyComponent={
                <View style={styles.center}>
                  <Text style={{ fontSize: 40 }}>👥</Text>
                  <Text style={{ color: theme.textMute, marginTop: 10, fontWeight: '500' }}>
                    {debouncedQuery.length > 0 ? t("common.noResults") : t("customer.noCustomers")}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 50 },
  
  // Kontrol Alanı (Search + Buttons)
  controlsArea: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    paddingBottom: 4, // Listeye çok yapışmasın
  },
  
  // Ekle Butonu
  iconBtn: {
    height: 50, // SearchInput yüksekliği ile aynı
    width: 50,
    borderRadius: 14, // SearchInput radius ile uyumlu
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#db2777",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // Görünüm Değiştirici (Switch)
  viewSwitcher: {
    flexDirection: 'row', 
    padding: 4, 
    borderRadius: 14, // Uyumlu radius
    alignItems: 'center', 
    height: 50, // SearchInput ile aynı yükseklik
  },
  switchBtn: { 
    borderRadius: 10, 
    height: 42, 
    width: 42, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});