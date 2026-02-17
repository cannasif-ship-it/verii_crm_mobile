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
import { LinearGradient } from "expo-linear-gradient";
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

  const mainBg = isDark ? "#0c0516" : "#FFFFFF";
  
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.12)', 'transparent', 'rgba(249, 115, 22, 0.12)']
    : ['rgba(255, 235, 240, 0.6)', '#FFFFFF', 'rgba(255, 240, 225, 0.6)']) as [string, string, ...string[]];

  const theme = {
    screenBg: "transparent",
    headerBg: "transparent",
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

  // Arama metnini gecikmeli olarak set ediyoruz (Performans için)
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // --- API BAĞLANTISI ---
  // 1. pageSize: 20 yaparak yükü hafifletiyoruz.
  // 2. debouncedQuery'i göndererek aramayı backend'de yapıyoruz.
  const { 
    data, 
    fetchNextPage,    // Sonraki sayfayı çekme fonksiyonu
    hasNextPage,      // Daha sayfa var mı kontrolü
    isFetchingNextPage, // Şu an altta loading dönüyor mu?
    isPending, 
    isError, 
    refetch, 
    isRefetching 
  } = useStocks({ pageSize: 20 }, debouncedQuery);

  // --- VERİ BİRLEŞTİRME ---
  // Artık client-side filtreleme (filter(...)) YOK. 
  // Backend ne gönderirse onu listeliyoruz.
  const stocks = useMemo(() => {
    return data?.pages?.flatMap(page => page.items || (page as any).Items || []) || [];
  }, [data]);

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

  // Listenin en altına gelince çalışacak fonksiyon
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Listenin en altındaki loading veya boşluk
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      );
    }
    // Bottom Navbar'ın altında kalmaması için güvenli boşluk
    return <View style={{ height: 100 }} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={StyleSheet.absoluteFill}>
          <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
          />
      </View>

      <View style={{ flex: 1 }}>
        <ScreenHeader title={t("stock.list")} showBackButton />

        <View style={styles.listContainer}>
          <View style={[styles.controlsArea, { backgroundColor: 'transparent' }]}>
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
                  paddingBottom: 20, // Alt boşluk renderFooter ile yönetiliyor
                  gap: GAP, 
              }}
              
              // --- INFINITE SCROLL AYARLARI ---
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5} // Listenin yarısına gelince yenisini çek
              ListFooterComponent={renderFooter}
              
              // --- PERFORMANS OPTİMİZASYONU ---
              removeClippedSubviews={true} // Ekran dışındakileri bellekten at
              initialNumToRender={10} 
              maxToRenderPerBatch={10}
              windowSize={5}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 50 },
  controlsArea: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
  },
  viewSwitcher: {
    flexDirection: 'row', padding: 4, borderRadius: 12, alignItems: 'center', height: 48,
  },
  switchBtn: { padding: 8, borderRadius: 8, height: 40, width: 40, alignItems: 'center', justifyContent: 'center' },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center'
  }
});