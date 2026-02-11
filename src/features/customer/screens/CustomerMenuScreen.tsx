import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { MenuCard } from "../components"; // Yeni Pembe MenuCard

// 1. Profesyonel İkonlar (Emojiler yerine)
import { 
  UserGroupIcon,      // Müşteriler
  Building02Icon,     // ERP Müşterileri
  UserCircleIcon,     // İlgili Kişiler
  Location01Icon,     // Sevk Adresleri
  Task01Icon,         // Unvanlar
  ArrowRight01Icon    // Sağ Ok
} from "hugeicons-react-native";

export function CustomerMenuScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Store verileri
  const { colors, themeMode } = useUIStore() as any;
  const insets = useSafeAreaInsets();
  const isDark = themeMode === "dark";

  // --- RENK VE TEMA AYARLARI ---
  const THEME_PINK = "#ec4899"; // Neon Pembe

  // Header Rengi: Kartlarla bütünlük sağlaması için
  const headerBg = isDark ? (colors?.header || "#1E293B") : "#FFFFFF";
  
  // İçerik Arka Planı: Sayfanın alt kısmı
  const contentBg = isDark ? (colors?.background || "#0f0518") : "#F8F9FA";

  // Arrow (Ok) Rengi
  const arrowColor = isDark ? "#64748B" : "#9CA3AF";

  // --- YÖNLENDİRMELER ---
  const handleCustomersPress = useCallback(() => {
    router.push("/(tabs)/customers/list");
  }, [router]);

  const handleContactsPress = useCallback(() => {
    router.push("/customers/contacts");
  }, [router]);

  const handleShippingPress = useCallback(() => {
    router.push("/(tabs)/customers/shipping");
  }, [router]);

  const handleTitlesPress = useCallback(() => {
    router.push("/(tabs)/customers/titles");
  }, [router]);

  const handleErpCustomersPress = useCallback(() => {
    router.push("/(tabs)/customers/erp");
  }, [router]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={headerBg} />
      
      {/* HEADER ALANI */}
      <View style={[styles.container, { backgroundColor: headerBg }]}>
        
        <ScreenHeader title={t("customerMenu.title")} showBackButton />
        
        {/* İÇERİK ALANI (Modern Yuvarlak Köşeler) */}
        <FlatListScrollView
          style={[styles.content, { backgroundColor: contentBg }]}
          contentContainerStyle={[
            styles.contentContainer, 
            { paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. MÜŞTERİLER */}
          <MenuCard
            title={t("customerMenu.customers")}
            description={t("customerMenu.customersDesc")}
            icon={
              <UserGroupIcon 
                size={24} 
                color={THEME_PINK} // Neon Pembe İkon
                variant="stroke" 
                strokeWidth={1.5}
              />
            }
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} variant="stroke" strokeWidth={2} />}
            onPress={handleCustomersPress}
          />

          {/* 2. ERP MÜŞTERİLERİ */}
          <MenuCard
            title={t("customerMenu.erpCustomers")}
            description={t("customerMenu.erpCustomersDesc")}
            icon={
              <Building02Icon 
                size={24} 
                color={THEME_PINK} 
                variant="stroke" 
                strokeWidth={1.5}
              />
            }
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} variant="stroke" strokeWidth={2} />}
            onPress={handleErpCustomersPress}
          />

          {/* 3. İLGİLİ KİŞİLER */}
          <MenuCard
            title={t("customerMenu.contacts")}
            description={t("customerMenu.contactsDesc")}
            icon={
              <UserCircleIcon 
                size={24} 
                color={THEME_PINK} 
                variant="stroke" 
                strokeWidth={1.5}
              />
            }
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} variant="stroke" strokeWidth={2} />}
            onPress={handleContactsPress}
          />

          {/* 4. SEVK ADRESLERİ */}
          <MenuCard
            title={t("customerMenu.shippingAddresses")}
            description={t("customerMenu.shippingAddressesDesc")}
            icon={
              <Location01Icon 
                size={24} 
                color={THEME_PINK} 
                variant="stroke" 
                strokeWidth={1.5}
              />
            }
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} variant="stroke" strokeWidth={2} />}
            onPress={handleShippingPress}
          />

          {/* 5. UNVANLAR */}
          <MenuCard
            title={t("customerMenu.titles")}
            description={t("customerMenu.titlesDesc")}
            icon={
              <Task01Icon 
                size={24} 
                color={THEME_PINK} 
                variant="stroke" 
                strokeWidth={1.5}
              />
            }
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} variant="stroke" strokeWidth={2} />}
            onPress={handleTitlesPress}
          />

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
    // Modern Bottom Sheet görünümü (Diğer sayfayla uyumlu olması için 32 yaptım)
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    // Hafif üst çizgi (Opsiyonel, şıklık katar)
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 32,
  },
});