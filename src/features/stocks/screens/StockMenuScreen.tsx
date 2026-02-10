import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation"; // Yolunuz farklıysa düzenleyin
import { useUIStore } from "../../../store/ui";
import { MenuCard } from "../components"; // MenuCard'ın olduğu yer

// Profesyonel İkonlar
import { 
  PackageIcon, 
  ArrowRight01Icon 
} from "hugeicons-react-native";

export function StockMenuScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Store'dan tema verilerini çekiyoruz
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const handleStockListPress = useCallback(() => {
    router.push("/(tabs)/stock/list"); // Veya "/stock" rotanız neyse
  }, [router]);

  // Stok Modülü Rengi: Temanızdaki Turuncu (accentSecondary)
  // Eğer undefined gelirse fallback olarak #f97316 kullanılır.
  const moduleColor = colors.accentSecondary || "#f97316";

  return (
    <>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      
      {/* HEADER ARKAPLANI: colors.header */}
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        
        <ScreenHeader 
          title={t("stockMenu.title", "Stok Yönetimi")} 
          showBackButton 
        />
        
        {/* İÇERİK ALANI: colors.background */}
        <FlatListScrollView
          style={[styles.content, { backgroundColor: colors.background }]}
          contentContainerStyle={[
            styles.contentContainer, 
            { paddingBottom: insets.bottom + 40 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* MENU KARTI */}
          <MenuCard
            title={t("stockMenu.stockMovements", "Stok Hareketleri")}
            description={t("stockMenu.stockMovementsDesc", "Giriş, çıkış ve transfer işlemlerini yönetin")}
            // GÜNCELLEME: Artık icon prop'una BİLEŞEN gönderiyoruz
            icon={
              <PackageIcon 
                size={24} 
                color={moduleColor} 
                variant="stroke" 
                strokeWidth={1.5}
              />
            }
            // İsterseniz sağ ikonu da buradan özelleştirebilirsiniz
            rightIcon={
              <ArrowRight01Icon 
                size={24} 
                color={colors.textMuted} 
                variant="stroke"
              />
            }
            onPress={handleStockListPress}
          />

          {/* İleride buraya "Depo Sayımı", "Ürün Listesi" gibi başka kartlar ekleyebilirsiniz */}

        </FlatListScrollView>
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
    // Modern "Bottom Sheet" görünümü için üst köşeleri yuvarlatıyoruz
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 32, // Kartların üst çizgiye yapışmaması için
  },
});