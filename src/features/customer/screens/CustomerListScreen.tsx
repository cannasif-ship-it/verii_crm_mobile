import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions, FlatList, Text as RNText } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useCustomers } from "../hooks";
import type { CustomerDto, PagedFilter } from "../types";
import { SearchInput } from "../components/SearchInput";
import { CustomerCard } from "../components/CustomerCard";

export function CustomerListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  
  // EXACT PIXEL PARTITIONING STRATEGY
  const screenHeight = Dimensions.get('window').height;
  const headerHeight = 60 + insets.top;
  const searchSectionHeight = 80;
  // Calculate exact remaining space for the list
  const listHeight = screenHeight - headerHeight - searchSectionHeight;

  const [searchText, setSearchText] = useState("");

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (searchText.trim().length >= 2) {
      return [{ column: "name", operator: "contains", value: searchText.trim() }];
    }
    return undefined;
  }, [searchText]);

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

  const customers = useMemo(() => {
    const list = data?.pages
      .flatMap((page) => page.items ?? [])
      .filter((item): item is CustomerDto => item != null) || [];
    return list;
  }, [data]);

  const handleCustomerPress = useCallback(
    (customer: CustomerDto) => {
      if (!customer?.id) return;
      router.push(`/(tabs)/customers/${customer.id}`);
    },
    [router]
  );

  const renderItem = useCallback(({ item }: { item: CustomerDto }) => (
    <CustomerCard 
       customer={item}
       onPress={() => handleCustomerPress(item)}
    />
  ), [handleCustomerPress]);

  return (
    <View style={{ height: screenHeight, backgroundColor: colors.background }}>
         <StatusBar style={themeMode === 'dark' ? "light" : "dark"} />
         
         {/* 1. HEADER SECTION (Fixed Height) */}
         <View style={{ height: headerHeight, zIndex: 100 }}>
            <ScreenHeader title={t("customer.title")} />
         </View>

         {/* 2. SEARCH SECTION (Fixed Height) */}
         <View style={{ height: searchSectionHeight, justifyContent: 'center', paddingHorizontal: 20 }}>
             <SearchInput
                 value={searchText}
                 onSearch={setSearchText}
                 placeholder={t("customer.searchPlaceholder")}
             />
         </View>

         {/* 3. LIST SECTION (Exact Remaining Height) */}
         <View style={{ height: listHeight }}>
             {/* Using FlatList instead of ScrollView for better Android rendering */}
             <FlatList
                 data={customers}
                 renderItem={renderItem}
                 keyExtractor={(item, index) => String(item?.id ?? index)}
                 style={{ flex: 1 }}
                 contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, flexGrow: 1 }}
                 refreshing={isRefetching && !isFetchingNextPage}
                 onRefresh={handleRefresh}
                 ListEmptyComponent={
                     !isLoading ? (
                         <View style={{ padding: 20, alignItems: 'center' }}>
                             <Text style={{ color: colors.textMuted }}>{t("common.noData")}</Text>
                         </View>
                     ) : null
                 }
                 ListFooterComponent={
                     (hasNextPage || isFetchingNextPage) ? (
                         <TouchableOpacity 
                             onPress={() => fetchNextPage()} 
                             style={{ padding: 15, alignItems: 'center', marginTop: 10 }}
                         >
                             {isFetchingNextPage ? 
                                 <ActivityIndicator color={colors.text} /> : 
                                 <Text style={{ color: colors.text, fontWeight: 'bold' }}>{t("common.loadMore")}</Text>
                             }
                         </TouchableOpacity>
                     ) : <View style={{ height: 50 }} />
                 }
             />
         </View>
     </View>
  );
}

const styles = StyleSheet.create({});
