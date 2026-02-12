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
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useCustomers } from "../hooks"; 
import { SearchInput } from "../components/SearchInput"; 
import { LayoutGridIcon, ListViewIcon, Add01Icon } from "hugeicons-react-native"; 
import type { CustomerDto } from "../types"; 
import { CustomerCard } from "../components/CustomerCard"; 

// Ekran boyutuna göre Grid hesaplaması
const { width } = Dimensions.get('window');
const GAP = 12; 
const PADDING = 16; 
const GRID_WIDTH = (width - (PADDING * 2) - GAP) / 2;

export function CustomerListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  
  // --- TEMA AYARLARI (Store'dan) ---
  const { themeMode, colors } = useUIStore();
  const isDark = themeMode === "dark";

  // Renkleri dinamik hale getirdik
  const theme = {
    screenBg: isDark ? "#1a0b2e" : colors.background,
    headerBg: isDark ? "#1a0b2e" : colors.card,
    textMute: isDark ? "#94a3b8" : colors.textMuted,
    primary: "#db2777",     
    activeSwitch: "#db2777",
    switchBg: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
    iconColor: isDark ? '#FFFFFF' : colors.text,
  };
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // --- API ---
  const { 
    data, 
    isLoading, 
    refetch, 
    isRefetching 
  } = useCustomers({ pageSize: 1000 }); 

  // --- FİLTRELEME ---
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

  const renderItem = useCallback(({ item }: { item: CustomerDto }) => (
    <View style={viewMode === 'grid' ? { width: GRID_WIDTH } : { width: '100%' }}>
        <CustomerCard 
          customer={item} 
          viewMode={viewMode}
          onPress={() => router.push(`/customers/${item.id}`)}
        />
    </View>
  ), [viewMode, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.headerBg} />
      
      <ScreenHeader title={t("customer.title")} showBackButton={true} />

      <View style={styles.listContainer}>
        {/* --- KONTROL ALANI --- */}
        <View style={[styles.controlsArea, { backgroundColor: theme.headerBg }]}>
          
          {/* Arama */}
          <View style={{ flex: 1, marginRight: 10 }}>
             <SearchInput value={searchText} onSearch={setSearchText} placeholder={t("customer.search")} />
          </View>
          
          {/* Ekle Butonu - Yeni Müşteri */}
          <TouchableOpacity
            onPress={handleCreatePress}
            style={[styles.iconBtn, { backgroundColor: theme.primary, marginRight: 8 }]}
            activeOpacity={0.8}
            accessibilityLabel={t("customer.create")}
            accessibilityRole="button"
          >
            <Add01Icon size={18} color="#FFF" variant="stroke" />
          </TouchableOpacity>

          {/* Grid/List Değiştirici */}
          <View style={[styles.viewSwitcher, { backgroundColor: theme.switchBg }]}>
            <TouchableWithoutFeedback onPress={() => setViewMode('grid')}>
              <View style={[styles.switchBtn, viewMode === 'grid' && { backgroundColor: theme.activeSwitch }]}>
                 <LayoutGridIcon 
                    size={18} 
                    color={viewMode === 'grid' ? '#FFF' : theme.textMute} 
                    variant="stroke" 
                 />
              </View>
            </TouchableWithoutFeedback>
            
            <TouchableWithoutFeedback onPress={() => setViewMode('list')}>
              <View style={[styles.switchBtn, viewMode === 'list' && { backgroundColor: theme.activeSwitch }]}>
                 <ListViewIcon 
                    size={18} 
                    color={viewMode === 'list' ? '#FFF' : theme.textMute} 
                    variant="stroke" 
                 />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>

        {/* --- LİSTE --- */}
        {isLoading && !data ? (
          <View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /></View>
        ) : (
          <FlatList
            key={viewMode} // Mod değişince listeyi sıfırla ki layout bozulmasın
            data={customers}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            
            // Grid ise 2 kolon, List ise 1
            numColumns={viewMode === 'grid' ? 2 : 1}
            
            // Grid modunda sütunlar arası boşluk
            columnWrapperStyle={viewMode === 'grid' ? { gap: GAP } : undefined}
            
            contentContainerStyle={{
                // === İŞTE BURASI ÖNEMLİ ===
                // List modunda kenar boşluklarını (Padding) SIFIRLIYORUZ (Tam genişlik)
                paddingHorizontal: viewMode === 'grid' ? PADDING : 0,
                
                paddingTop: viewMode === 'grid' ? 12 : 0,
                paddingBottom: 40,
                
                // List modunda elemanlar arası boşluğu (Gap) SIFIRLIYORUZ (Bitişik olsun)
                gap: viewMode === 'grid' ? GAP : 0, 
            }}
            
            ListFooterComponent={<View style={{ height: 20 }} />}
            refreshing={isRefetching}
            onRefresh={refetch}
            
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ fontSize: 40 }}>👥</Text>
                <Text style={{ color: theme.textMute, marginTop: 10 }}>
                  {debouncedQuery.length > 0 ? t("common.noResults") : t("customer.noCustomers")}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 50 },
  
  controlsArea: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    // Header altında hafif bir ayırıcı çizgi olabilir (opsiyonel)
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(255,255,255,0.05)', 
  },
  
  viewSwitcher: {
    flexDirection: 'row', 
    padding: 4, 
    borderRadius: 12, 
    alignItems: 'center', 
    height: 48,
  },
  switchBtn: { 
    padding: 8, 
    borderRadius: 8, 
    height: 40, 
    width: 40, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  
  iconBtn: {
    height: 48,
    width: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});