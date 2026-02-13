import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useStock, useStockRelations } from "../hooks";
import { StockDetailContent } from "../components";
import { Alert02Icon, RefreshIcon } from "hugeicons-react-native";

export function StockDetailScreen(): React.ReactElement {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  const isDark = themeMode === "dark";

  const mainBg = isDark ? "#0c0516" : "#FFFFFF";
  const accentColor = colors.accent || "#db2777";

  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.12)', 'transparent', 'rgba(249, 115, 22, 0.12)']
    : ['rgba(255, 235, 240, 0.6)', '#FFFFFF', 'rgba(255, 240, 225, 0.6)']) as [string, string, ...string[]];

  const stockId = id ? Number(id) : undefined;
  const { data: stock, isLoading, isError, refetch } = useStock(stockId);
  const { data: relationsData } = useStockRelations({ stockId });

  const relations = useMemo(() => {
    if (stock?.parentRelations && Array.isArray(stock.parentRelations) && stock.parentRelations.length > 0) {
      return stock.parentRelations;
    }
    if (!relationsData?.pages) return [];
    return (
      relationsData.pages
        .flatMap((page) => page.items ?? [])
        .filter((item) => item != null) || []
    );
  }, [stock?.parentRelations, relationsData]);

  return (
    <View style={[styles.mainContainer, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={StyleSheet.absoluteFill}>
          <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
          />
      </View>

      <View style={styles.contentLayer}>
        <ScreenHeader title={t("stock.detail")} showBackButton />

        <View style={styles.body}>
          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={accentColor} />
            </View>
          ) : isError ? (
            <View style={styles.centerState}>
              <View style={[styles.errorIconBox, { borderColor: colors.border }]}>
                 <Alert02Icon size={32} color={colors.error || "#ef4444"} variant="stroke" />
              </View>
              <Text style={[styles.errorTitle, { color: colors.text }]}>
                {t("common.error")}
              </Text>
              <Text style={[styles.errorDesc, { color: colors.textMuted }]}>
                Veri yüklenirken bir sorun oluştu.
              </Text>
              
              <TouchableOpacity 
                onPress={() => refetch()} 
                style={[styles.retryBtn, { borderColor: colors.border }]}
              >
                <RefreshIcon size={16} color={colors.text} />
                <Text style={[styles.retryText, { color: colors.text }]}>
                  {t("common.retry")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : stock ? (
            <StockDetailContent
              stock={stock}
              relations={relations}
              colors={{...colors, background: 'transparent'}}
              insets={insets}
              t={t}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },
  body: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
  },
  errorDesc: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "500",
  },
});