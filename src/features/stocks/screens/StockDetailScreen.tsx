import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

  // --- RENK AYARLARI ---
  // Arka planı tek renk yapıyoruz, böylece "kutu içinde kutu" hissi kayboluyor.
  const backgroundColor = colors.background; 
  const accentColor = colors.accent || "#db2777";

  const stockId = id ? Number(id) : undefined;
  const { data: stock, isLoading, isError, refetch } = useStock(stockId);
  const { data: relationsData } = useStockRelations({ stockId });

  // --- MANTIK DEĞİŞMEDİ ---
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
    <View style={[styles.mainContainer, { backgroundColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* HEADER: Arka planla aynı renkte, bütünleşik durur */}
      <ScreenHeader title={t("stock.detail")} showBackButton />

      {/* İÇERİK: Yuvarlak köşeler YOK, kenarlıklar YOK. Tam ekran akar. */}
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
          // BAŞARILI DURUM
          // İçeriği saran ekstra bir View veya stil yok. Doğrudan render ediyoruz.
          <StockDetailContent
            stock={stock}
            relations={relations}
            colors={colors}
            insets={insets}
            t={t}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    // Burada border radius yok, shadow yok. Dümdüz, temiz bir ekran.
  },
  body: {
    flex: 1,
    // İçeriğin header'a yapışmaması için çok hafif bir padding eklenebilir ama
    // StockDetailContent içinde zaten padding vardır diye varsayıyoruz.
  },
  
  // --- Loading / Error States (Minimalist) ---
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12, // Hafif yumuşak kare
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    // Arkaplan yok, sadece ince çizgi (Wireframe stili)
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