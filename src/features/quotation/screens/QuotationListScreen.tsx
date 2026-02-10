import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Text, // Text bileşenini react-native'den alıyoruz, stil kontrolü bizde olsun
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useQuotationList, useCreateRevisionOfQuotation } from "../hooks";
import { QuotationRow } from "../components/QuotationRow";
import { SearchInput } from "../../customer/components"; // Mevcut SearchInput
import type { QuotationGetDto, PagedFilter } from "../types";
// İkon kütüphanesi projenizde yoksa burayı Text/Emoji ile değiştirebilirsiniz
// StockListScreen referansına göre eklendi:
import { Add01Icon } from "hugeicons-react-native"; 

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 16;

export function QuotationListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  
  const isDark = themeMode === "dark";

  // --- STOCKLIST TEMA TANIMLAMASI ---
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
    error: "#ef4444",
  };

  const [sortBy, setSortBy] = useState<string>("Id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Arama state'leri (StockList mantığıyla)
  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce etkisi
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Filtreleme Mantığı (Mevcut yapıyı koruyoruz)
  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (debouncedQuery.trim().length >= 2) {
      return [
        { column: "OfferNo", operator: "contains", value: debouncedQuery.trim() },
        {
          column: "PotentialCustomerName",
          operator: "contains",
          value: debouncedQuery.trim(),
        },
      ];
    }
    return undefined;
  }, [debouncedQuery]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuotationList({
    filters,
    sortBy,
    sortDirection,
  });

  const createRevisionMutation = useCreateRevisionOfQuotation();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRowClick = useCallback(
    (id: number) => {
      router.push(`/(tabs)/sales/quotations/${id}`);
    },
    [router]
  );

  const handleRevision = useCallback(
    (e: any, id: number) => {
      e.stopPropagation();
      createRevisionMutation.mutate(id);
    },
    [createRevisionMutation]
  );

  const handleCreatePress = useCallback(() => {
    router.push("/(tabs)/sales/quotations/create");
  }, [router]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Veri Düzleştirme
  const quotations = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page.items ?? [])
        .filter((item): item is QuotationGetDto => item != null) || []
    );
  }, [data]);

  // --- RENDER ITEMS ---

  const renderItem = useCallback(
    ({ item }: { item: QuotationGetDto }) => {
      return (
        // StockCard stiline benzetilmiş wrapper
        <View style={[
            styles.cardWrapper, 
            { 
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder
            }
        ]}>
            {/* QuotationRow'un stilini bozmamak için olduğu gibi kullanıyoruz, 
                ancak dış çerçeve StockList havasını veriyor */}
            <QuotationRow
                quotation={item}
                onPress={handleRowClick}
                onRevision={handleRevision}
                isPending={createRevisionMutation.isPending}
            />
        </View>
      );
    },
    [handleRowClick, handleRevision, createRevisionMutation.isPending, theme]
  );

  const renderEmpty = useCallback(() => {
    if (isLoading || isFetching) return null;
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.textMute, fontSize: 16 }}>
          {debouncedQuery.length > 0
            ? t("quotation.noQuotations") // "Kayıt bulunamadı"
            : t("quotation.noQuotations")}
        </Text>
      </View>
    );
  }, [isLoading, isFetching, theme, t, debouncedQuery]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return <View style={{ height: 40 }} />;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }, [isFetchingNextPage, theme]);

  // --- ERROR STATE ---
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.headerBg} />
        <ScreenHeader title={t("quotation.list")} showBackButton />
        <View style={styles.center}>
          <Text style={{ color: theme.error, marginBottom: 12 }}>{t("common.error")}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]} 
            onPress={() => refetch()}
          >
             <Text style={{ color: "#FFF", fontWeight: "600" }}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- MAIN RENDER ---
  return (
    <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.headerBg} />
      
      {/* StockList Tarzı Header */}
      <ScreenHeader title={t("quotation.list")} showBackButton />

      <View style={styles.listContainer}>
        
        {/* CONTROLS AREA (StockList Tasarımı Birebir) */}
        <View style={[styles.controlsArea, { backgroundColor: theme.headerBg }]}>
            {/* Arama Kutusu */}
            <View style={{ flex: 1, marginRight: 10 }}>
                <SearchInput 
                    value={searchText} 
                    onSearch={setSearchText} 
                    placeholder={t("quotation.searchPlaceholder")}
                />
            </View>
          
            {/* Sağ Buton: Tasarımda Grid/List switcheri vardı, burada 'Create New' olarak kullanıyoruz */}
            <View style={[styles.actionBtnContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                <TouchableWithoutFeedback onPress={handleCreatePress}>
                    <View style={[styles.iconBtn, { backgroundColor: theme.activeSwitch }]}>
                         {/* Eğer hugeicons yoksa buraya <Text style={{color:'#FFF', fontSize: 24}}>+</Text> yazabilirsiniz */}
                         <Add01Icon size={20} color="#FFF" variant="stroke" />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </View>

        {/* LOADING STATE */}
        {isLoading && !data ? (
           <View style={styles.center}>
             <ActivityIndicator size="large" color={theme.primary} />
           </View>
        ) : (
          <FlatList
            data={quotations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
                paddingHorizontal: PADDING,
                paddingTop: 12,
                paddingBottom: insets.bottom + 20,
                gap: GAP, 
            }}
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1 },
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 50 
  },
  // Header Controls
  controlsArea: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
  },
  // Sağ taraftaki kutucuk (Eski ViewSwitcher, Yeni Create Button)
  actionBtnContainer: {
    flexDirection: 'row', 
    padding: 4, 
    borderRadius: 12, 
    alignItems: 'center', 
    height: 48,
    width: 48, // Kare yaptık
    justifyContent: 'center'
  },
  iconBtn: { 
    padding: 8, 
    borderRadius: 8, 
    height: 40, 
    width: 40, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  // Kart Stili
  cardWrapper: {
    borderRadius: 16, // StockCard ile uyumlu radius
    borderWidth: 1,
    overflow: 'hidden', // İçerik taşmasın
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  }
});