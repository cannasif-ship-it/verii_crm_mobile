import React, { useCallback, useMemo, useState, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  TouchableWithoutFeedback,
  Dimensions,
  Text 
} from "react-native";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { useTitles, useDeleteTitle } from "../hooks";
import { SearchInput, TitleCard, TitleFormModal } from "../components";
import type { TitleDto, PagedFilter } from "../types";
// İkon ekliyoruz (Tasarım bütünlüğü için)
import { Add01Icon } from "hugeicons-react-native";

const GAP = 12;
const PADDING = 16;

export function TitleListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const { themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  const deleteTitle = useDeleteTitle();

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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<TitleDto | null>(null);

  // Arama gecikmesi (Performans için)
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchText); }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (debouncedQuery.trim().length >= 2) {
      return [{ column: "TitleName", operator: "contains", value: debouncedQuery.trim() }];
    }
    return undefined;
  }, [debouncedQuery]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useTitles({ filters });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const titles = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page.items ?? [])
        .filter((item): item is TitleDto => item != null) || []
    );
  }, [data]);

  // --- ACTIONS ---

  const handleTitlePress = useCallback((title: TitleDto) => {
    setSelectedTitle(title);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((title: TitleDto) => {
    setSelectedTitle(title);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    (title: TitleDto) => {
      Alert.alert(
        t("titleManagement.deleteConfirm"),
        t("titleManagement.deleteConfirmMessage", { name: title.titleName }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: () => {
              deleteTitle.mutate(title.id);
            },
          },
        ]
      );
    },
    [deleteTitle, t]
  );

  const handleCreatePress = useCallback(() => {
    setSelectedTitle(null);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSelectedTitle(null);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // --- RENDER ITEMS ---

  const renderItem = useCallback(
    ({ item }: { item: TitleDto }) => {
      if (!item) return null;
      return (
        // Wrapper ile Tema Uyumu
        <View style={[
            styles.cardWrapper, 
            { 
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder
            }
        ]}>
            <TitleCard
              title={item}
              onPress={() => handleTitlePress(item)}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
        </View>
      );
    },
    [handleTitlePress, handleEdit, handleDelete, theme]
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
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
        <Text style={{ color: theme.textMute, fontSize: 16 }}>
          {t("titleManagement.noTitles")}
        </Text>
      </View>
    );
  }, [isLoading, theme, t]);

  // --- ERROR STATE ---
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
        <ScreenHeader title={t("titleManagement.title")} showBackButton />
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
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.headerBg} />
      
      <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
        {/* Header - RightContent'i kaldırdık, aşağıya taşıdık */}
        <ScreenHeader
          title={t("titleManagement.title")}
          showBackButton
        />

        <View style={styles.listContainer}>
            {/* CONTROLS AREA (Arama + Ekle Butonu) */}
            <View style={[styles.controlsArea, { backgroundColor: theme.headerBg }]}>
                 {/* Arama Inputu */}
                 <View style={{ flex: 1, marginRight: 10 }}>
                    <SearchInput
                        value={searchText}
                        onSearch={setSearchText}
                        placeholder={t("titleManagement.searchPlaceholder")}
                    />
                 </View>

                 {/* Yeni Ekle Butonu (Sağdaki kare buton) */}
                 <View style={[styles.actionBtnContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                    <TouchableWithoutFeedback onPress={handleCreatePress}>
                        <View style={[styles.iconBtn, { backgroundColor: theme.activeSwitch }]}>
                             <Add01Icon size={20} color="#FFF" variant="stroke" />
                        </View>
                    </TouchableWithoutFeedback>
                 </View>
            </View>

            {/* LOADING & LIST */}
            {isLoading && titles.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={titles}
                    keyExtractor={(item, index) => String(item?.id ?? index)}
                    renderItem={renderItem}
                    contentContainerStyle={{
                        paddingHorizontal: PADDING,
                        paddingTop: 12,
                        paddingBottom: insets.bottom + 20,
                        gap: GAP, 
                    }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    refreshing={isRefetching && !isFetchingNextPage}
                    onRefresh={handleRefresh}
                />
            )}
        </View>
      </View>

      <TitleFormModal
        visible={modalVisible}
        onClose={handleModalClose}
        title={selectedTitle}
      />
    </>
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
  // Controls (Header altı)
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
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  }
});