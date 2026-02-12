import React, { useCallback, useMemo, useState, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  TouchableWithoutFeedback, 
  Text, 
  Dimensions 
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useStocks } from "../hooks";
import { SearchInput } from "../components/SearchInput"; 
import { LayoutGridIcon, ListViewIcon } from "hugeicons-react-native"; 
import type { StockGetDto } from "../types";
import { StockCard } from "../components/StockCard"; 

const { width } = Dimensions.get('window');
const GAP = 12; 
const PADDING = 16; 
const GRID_WIDTH = (width - (PADDING * 2) - GAP) / 2;

export function StockListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { themeMode } = useUIStore() as any;
  const isDark = themeMode === "dark";
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const theme = {
    screenBg: isDark ? "#1a0b2e" : "#F8FAFC",
    headerBg: isDark ? "#1a0b2e" : "#FFFFFF",
    cardBg: isDark ? "#1e1b29" : "#FFFFFF", 
    cardBorder: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
    textTitle: isDark ? "#FFFFFF" : "#0F172A",
    textMute: isDark ? "#94a3b8" : "#64748B",
    primary: "#db2777",     
    primaryBg: isDark ? "rgba(219, 39, 119, 0.15)" : "rgba(219, 39, 119, 0.1)",
    activeSwitch: "#db2777",
  };

  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Arama gecikmesi
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // --- API AYARLARI ---
  // HİLE BURADA: Backend filtrelemiyorsa, biz hepsini çeker telefonda filtreleriz.
  // pageSize: 1000 yaparak tüm stokları çekiyoruz.
  const { 
    data, 
    isPending, 
    isError, 
    refetch, 
    isRefetching 
  } = useStocks({ pageSize: 1000 }); // <-- 1000 YAPTIK (Tüm veriyi al)

  // --- ARAMA MANTIĞI (TELEFONDA) ---
  const stocks = useMemo(() => {
    // Tüm verileri tek listede topla
    const allStocks = data?.pages?.flatMap(page => (page as any).items || (page as any).Items || []) || [];

    // Arama kutusu boşsa veya 2 harften azsa hepsini göster
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      return allStocks;
    }

    // Arama varsa FİLTRELE
    const lowerText = debouncedQuery.toLowerCase();
    return allStocks.filter((item: StockGetDto) => {
      // StockName, ErpStockCode veya GrupAdi içinde ara
      const nameMatch = item.stockName?.toLowerCase().includes(lowerText);
      const codeMatch = item.erpStockCode?.toLowerCase().includes(lowerText);
      const groupMatch = item.grupAdi?.toLowerCase().includes(lowerText);
      
      return nameMatch || codeMatch || groupMatch;
    });

  }, [data, debouncedQuery]);

  const renderItem = useCallback(({ item }: { item: StockGetDto }) => (
    <StockCard 
      item={item} 
      viewMode={viewMode} 
      isDark={isDark} 
      router={router} 
      theme={theme}
      gridWidth={GRID_WIDTH}
    />
  ), [viewMode, isDark, theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.headerBg} />
      <ScreenHeader title={t("stock.list")} showBackButton />

      <View style={styles.listContainer}>
        {/* HEADER */}
        <View style={[styles.controlsArea, { backgroundColor: theme.headerBg }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
             <SearchInput value={searchText} onSearch={setSearchText} />
          </View>
          
          <View style={[styles.viewSwitcher, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
            <TouchableWithoutFeedback onPress={() => setViewMode('grid')}>
              <View style={[styles.switchBtn, viewMode === 'grid' && { backgroundColor: theme.activeSwitch }]}>
                 <LayoutGridIcon size={18} color={viewMode === 'grid' ? '#FFF' : theme.textMute} variant="stroke" />
              </View>
            </TouchableWithoutFeedback>
            
            <TouchableWithoutFeedback onPress={() => setViewMode('list')}>
              <View style={[styles.switchBtn, viewMode === 'list' && { backgroundColor: theme.activeSwitch }]}>
                 <ListViewIcon size={18} color={viewMode === 'list' ? '#FFF' : theme.textMute} variant="stroke" />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>

        {isPending && !data ? (
          <View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /></View>
        ) : isError ? (
          <View style={styles.center}><Text style={{ color: "red" }}>Hata oluştu.</Text></View>
        ) : (
          <FlatList
            key={viewMode} 
            data={stocks}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            numColumns={viewMode === 'grid' ? 2 : 1}
            columnWrapperStyle={viewMode === 'grid' ? { gap: GAP } : undefined}
            contentContainerStyle={{
                paddingHorizontal: PADDING,
                paddingTop: 12,
                paddingBottom: 40,
                gap: GAP, 
            }}
            // Pagination kapattık çünkü hepsini çektik
            ListFooterComponent={<View style={{ height: 20 }} />}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ color: theme.textMute }}>
                   {debouncedQuery.length > 0
                    ? "Kayıt bulunamadı."
                    : "Listeniz boş."}
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
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
  },
  viewSwitcher: {
    flexDirection: 'row', padding: 4, borderRadius: 12, alignItems: 'center', height: 48,
  },
  switchBtn: { padding: 8, borderRadius: 8, height: 40, width: 40, alignItems: 'center', justifyContent: 'center' },
});