import React, { useCallback, useMemo, useState, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Dimensions,
  Text 
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useCustomers } from "../hooks";
import type { CustomerDto, PagedFilter } from "../types";
import { SearchInput } from "../components/SearchInput";
import { CustomerCard } from "../components/CustomerCard";
// Tasarım bütünlüğü için ikon
import { Add01Icon } from "hugeicons-react-native";

const GAP = 12;
const PADDING = 16;

export function CustomerListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  
  const isDark = themeMode === "dark";

  // --- TEMA AYARLARI ---
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

  const [searchText, setSearchText] = useState("");
  // Performans için debounce (Diğer ekranlarla aynı yapı)
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Filtreleme Mantığı (Backend verisi bozulmadı)
  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (debouncedQuery.trim().length >= 2) {
      return [{ column: "name", operator: "contains", value: debouncedQuery.trim() }];
    }
    return undefined;
  }, [debouncedQuery]);

  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useCustomers({ filters });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Veri Düzleştirme
  const customers = useMemo(() => {
    return data?.pages
      .flatMap((page) => page.items ?? [])
      .filter((item): item is CustomerDto => item != null) || [];
  }, [data]);

  const handleCustomerPress = useCallback(
    (customer: CustomerDto) => {
      if (!customer?.id) return;
      router.push(`/(tabs)/customers/${customer.id}`);
    },
    [router]
  );

  const handleCreatePress = useCallback(() => {
    // Standart create rotası (Diğer listelerdeki mantığa göre eklendi)
    router.push("/(tabs)/customers/create");
  }, [router]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- RENDER ITEMS ---

  const renderItem = useCallback(
    ({ item }: { item: CustomerDto }) => {
      return (
        // Wrapper: Tema uyumu için çerçeve
        <View style={[
            styles.cardWrapper, 
            { 
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder
            }
        ]}>
            <CustomerCard 
               customer={item}
               onPress={() => handleCustomerPress(item)}
            />
        </View>
      );
    },
    [handleCustomerPress, theme]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return <View style={{ height: 40 }} />;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }, [isFetchingNextPage, theme]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👥</Text>
        <Text style={{ color: theme.textMute, fontSize: 16 }}>
          {t("common.noData")}
        </Text>
      </View>
    );
  }, [isLoading, theme, t]);

  // --- MAIN RENDER ---
  return (
    <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.headerBg} />
      
      <ScreenHeader title={t("customer.title")} showBackButton={false} />

      <View style={styles.listContainer}>
        
        {/* CONTROLS AREA (Header Altı - Arama ve Ekleme) */}
        <View style={[styles.controlsArea, { backgroundColor: theme.headerBg }]}>
             {/* Arama Inputu */}
             <View style={{ flex: 1, marginRight: 10 }}>
                <SearchInput
                    value={searchText}
                    onSearch={setSearchText}
                    placeholder={t("customer.searchPlaceholder")}
                />
             </View>

             {/* Yeni Ekle Butonu (Tasarım bütünlüğü için eklendi) */}
             <View style={[styles.actionBtnContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                <TouchableWithoutFeedback onPress={handleCreatePress}>
                    <View style={[styles.iconBtn, { backgroundColor: theme.activeSwitch }]}>
                         <Add01Icon size={20} color="#FFF" variant="stroke" />
                    </View>
                </TouchableWithoutFeedback>
             </View>
        </View>

        {/* LOADING & LIST */}
        {isLoading && customers.length === 0 ? (
           <View style={styles.center}>
             <ActivityIndicator size="large" color={theme.primary} />
           </View>
        ) : (
          <FlatList
            data={customers}
            renderItem={renderItem}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            contentContainerStyle={{
                paddingHorizontal: PADDING,
                paddingTop: 12,
                paddingBottom: insets.bottom + 20,
                gap: GAP, 
            }}
            showsVerticalScrollIndicator={false}
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
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
  // Controls Area
  controlsArea: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
  },
  actionBtnContainer: {
    flexDirection: 'row', 
    padding: 4, 
    borderRadius: 12, 
    alignItems: 'center', 
    height: 48,
    width: 48, 
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
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});