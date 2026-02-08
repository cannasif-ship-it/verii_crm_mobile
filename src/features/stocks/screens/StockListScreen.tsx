import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useStocks } from "../hooks";
import { StockCard } from "../components"; // Yeni kartı import et
import { SearchInput } from "../components"; // Yeni inputu import et
import type { StockGetDto } from "../types";

export function StockListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { themeMode } = useUIStore() as any;
  const isDark = themeMode === "dark";

  // Renkler (Arkaplan koyu olsun ki kartlar belli olsun)
  const screenBg = isDark ? "#0f0518" : "#F8FAFC";
  const headerBg = isDark ? "#0f0518" : "#FFFFFF";

  // State
  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 1. Arama Gecikmesi (Debounce): Her harfte değil, yazma bitince ara
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchText);
    }, 500); // 500ms bekle
    return () => clearTimeout(handler);
  }, [searchText]);

  // 2. Filtreleri Hazırla
  const filters = useMemo(() => {
    if (debouncedQuery.trim().length >= 2) {
      return [{ column: "stockName", operator: "contains", value: debouncedQuery.trim() }];
    }
    return undefined;
  }, [debouncedQuery]);

  // 3. Veriyi Çek (Pagination: pageSize 20)
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useStocks({ filters, pageSize: 20 });

  // 4. Sayfaları Birleştir
  const stocks = useMemo(() => {
    return data?.pages?.flatMap(page => (page as any).items || (page as any).Items || []) || [];
  }, [data]);

  // Liste Elemanı Render
  const renderItem = useCallback(({ item }: { item: StockGetDto }) => (
    <StockCard stock={item} onPress={() => router.push(`/(tabs)/stock/${item.id}`)} />
  ), [router]);

  // Altbilgi (Yükleniyor...)
  const renderFooter = () => {
    if (!isFetchingNextPage) return <View style={{ height: 20 }} />;
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator size="small" color="#ec4899" />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={headerBg} />
      
      {/* Header */}
      <ScreenHeader title={t("stock.list", "Stok Listesi")} showBackButton />

      {/* Ana Liste */}
      <View style={styles.listContainer}>
        {/* Arama Çubuğu (Listenin dışında sabit) */}
        <View style={[styles.searchArea, { backgroundColor: headerBg }]}>
          <SearchInput value={searchText} onSearch={setSearchText} />
        </View>

        {isPending && !data ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#ec4899" />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={{ color: "red" }}>Hata oluştu.</Text>
            <TouchableOpacity onPress={() => refetch()}><Text>Tekrar Dene</Text></TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={stocks}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            // Kartlar arasındaki boşluk
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            // Sonsuz Kaydırma
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ color: "#94A3B8" }}>Kayıt bulunamadı.</Text>
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
  searchArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
});