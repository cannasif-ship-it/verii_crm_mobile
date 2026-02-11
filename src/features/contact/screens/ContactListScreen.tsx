import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Text as RNText } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { CustomRefreshControl } from "../../../components/CustomRefreshControl";
import { useUIStore } from "../../../store/ui";
import { SearchInput } from "../../customer";
import { useContacts } from "../hooks";
import { ContactCard } from "../components";
import type { ContactDto, PagedFilter } from "../types";

export function ContactListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (searchText.trim().length >= 2) {
      return [{ column: "fullName", operator: "contains", value: searchText.trim() }];
    }
    return undefined;
  }, [searchText]);

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useContacts({ filters });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const contacts = useMemo(() => {
    const pages = data?.pages ?? [];
    return pages
      .flatMap((page) => {
        const pageData = page as unknown as { items?: ContactDto[]; Items?: ContactDto[] };
        if (Array.isArray(pageData.items)) return pageData.items;
        if (Array.isArray(pageData.Items)) return pageData.Items;
        return [];
      })
      .filter((item): item is ContactDto => item != null);
  }, [data]);

  const isInitialLoading = isPending && contacts.length === 0;

  const handleContactPress = useCallback(
    (contact: ContactDto) => {
      if (!contact?.id) return;
      router.push(`/customers/contacts/${contact.id}`);
    },
    [router]
  );

  const handleCreatePress = useCallback(() => {
    router.push("/customers/contacts/create");
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderEmpty = useCallback(() => {
    if (isInitialLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}> 
          {t("contact.noContacts")}
        </Text>
      </View>
    );
  }, [isInitialLoading, colors, t]);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}> 
        <ScreenHeader
          title={t("contact.title")}
          showBackButton
          rightElement={
            <TouchableOpacity onPress={handleCreatePress} style={styles.addButton}>
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          }
        />
        <View style={[styles.content, { backgroundColor: contentBackground }]}> 
          <View style={styles.topSection}>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.accent }]}
              onPress={handleCreatePress}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonIcon}>+</Text>
              <Text style={styles.createButtonText}>{t("contact.create")}</Text>
            </TouchableOpacity>
            <SearchInput
              value={searchText}
              onSearch={setSearchText}
              placeholder={t("contact.searchPlaceholder")}
            />
          </View>

          {isInitialLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>{t("common.error")}</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: colors.accent }]}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatListScrollView
              style={styles.list}
              contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                Platform.OS === "android"
                  ? undefined
                  : <CustomRefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={handleRefresh} />
              }
            >
              {contacts.length === 0 ? renderEmpty() : null}
              {contacts.map((item, index) =>
                Platform.OS === "android" ? (
                  <TouchableOpacity
                    key={String(item.id ?? index)}
                    style={styles.androidCard}
                    onPress={() => handleContactPress(item)}
                    activeOpacity={0.8}
                  >
                    <RNText style={styles.androidCardTitle}>{item.fullName || "-"}</RNText>
                    <RNText style={styles.androidCardSub}>{item.titleName || "Unvan: -"}</RNText>
                    <RNText style={styles.androidCardSub}>{item.phone || item.mobile || "-"}</RNText>
                  </TouchableOpacity>
                ) : (
                  <ContactCard
                    key={String(item.id ?? index)}
                    contact={item}
                    onPress={() => handleContactPress(item)}
                  />
                )
              )}
              {hasNextPage ? (
                <TouchableOpacity
                  style={[styles.loadMoreButton, { borderColor: colors.cardBorder }]}
                  onPress={handleLoadMore}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <Text style={{ color: colors.text }}>{t("common.loadMore", "Daha Fazla")}</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </FlatListScrollView>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  createButtonIcon: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  createButtonText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 22,
  },
  loadMoreButton: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  androidCard: {
    backgroundColor: "#1f2937",
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  androidCardTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  androidCardSub: {
    color: "#cbd5e1",
    fontSize: 13,
  },
});
