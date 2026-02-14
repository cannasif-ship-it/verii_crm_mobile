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
} from "react-native";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient"; // Eklendi
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { CustomRefreshControl } from "../../../components/CustomRefreshControl"; // Eğer varsa bunu kullanabilirsin
import { useUIStore } from "../../../store/ui";
import { useTitles, useDeleteTitle } from "../hooks";
import { SearchInput, TitleCard, TitleFormModal } from "../components";
import type { TitleDto, PagedFilter } from "../types";
import { Add01Icon } from "hugeicons-react-native";

const GAP = 14;
const PADDING = 20;

export function TitleListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  const deleteTitle = useDeleteTitle();

  const isDark = themeMode === "dark";

  // 1. Standart Ambient Gradient Yapısı
  const mainBg = isDark ? "#0c0516" : "#FFFFFF";
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.12)', 'transparent', 'rgba(249, 115, 22, 0.12)'] 
    : ['rgba(255, 235, 240, 0.6)', '#FFFFFF', 'rgba(255, 240, 225, 0.6)']) as [string, string, ...string[]];

  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<TitleDto | null>(null);

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

  const renderItem = useCallback(
    ({ item }: { item: TitleDto }) => {
      if (!item) return null;
      return (
        <View style={styles.cardWrapper}>
            <TitleCard
              title={item}
              onPress={() => handleTitlePress(item)}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
        </View>
      );
    },
    [handleTitlePress, handleEdit, handleDelete]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return <View style={{ height: 40 }} />;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#db2777" />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
        <Text style={{ color: colors.textMuted, fontSize: 16 }}>
          {t("titleManagement.noTitles")}
        </Text>
      </View>
    );
  }, [isLoading, colors.textMuted, t]);

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: mainBg }]}>
        <ScreenHeader title={t("titleManagement.title")} showBackButton />
        <View style={styles.center}>
            <Text style={{ color: colors.error, marginBottom: 12 }}>{t("common.error")}</Text>
            <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: "#db2777" }]} 
                onPress={() => refetch()}
            >
                <Text style={{ color: "#FFF", fontWeight: "600" }}>{t("common.retry")}</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
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

        <View style={{ flex: 1 }}>
            <ScreenHeader
              title={t("titleManagement.title")}
              showBackButton
            />

            <View style={styles.listContainer}>
                {/* Üst Kontrol Alanı - Arka planı transparent yaptık */}
                <View style={styles.controlsArea}>
                     <View style={{ flex: 1, marginRight: 12 }}>
                        <SearchInput
                            value={searchText}
                            onSearch={setSearchText}
                            placeholder={t("titleManagement.searchPlaceholder")}
                        />
                     </View>

                     <TouchableOpacity 
                        onPress={handleCreatePress}
                        activeOpacity={0.8}
                        style={[styles.addButton, { backgroundColor: "#db2777" }]}
                     >
                        <Add01Icon size={20} color="#FFF" variant="stroke" />
                     </TouchableOpacity>
                </View>

                {isLoading && titles.length === 0 ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#db2777" />
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
                        style={styles.content}
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
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  center: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 50 
  },
  controlsArea: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#db2777",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardWrapper: {
    // Wrapper artık sadece FlatList gap'ine güveniyor, tasarım TitleCard içinde.
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