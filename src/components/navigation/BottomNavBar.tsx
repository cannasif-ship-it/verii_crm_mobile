import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../ui/text";
import { useUIStore } from "../../store/ui";
// Tema renklerini import ediyoruz
import { GRADIENT } from "../../constants/theme"; 

// HugeIcons Importları
import { 
  PackageIcon, 
  UserGroupIcon, 
  Home01Icon, 
  Money03Icon, 
  Calendar03Icon 
} from "hugeicons-react-native";

interface NavItem {
  key: string;
  icon: any; 
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "stock", icon: PackageIcon, route: "/(tabs)/stock" },
  { key: "customers", icon: UserGroupIcon, route: "/(tabs)/customers" },
  { key: "home", icon: Home01Icon, route: "/(tabs)" },
  { key: "sales", icon: Money03Icon, route: "/(tabs)/sales" },
  { key: "activities", icon: Calendar03Icon, route: "/(tabs)/activities" },
];

export function BottomNavBar(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  // Store'dan gelen dinamik renkler
  const { colors } = useUIStore();

  const isActive = (route: string): boolean => {
    if (route === "/(tabs)") {
      return pathname === "/" || pathname === "/(tabs)" || pathname === "/index";
    }
    return pathname === route || pathname.startsWith(route.replace("/(tabs)", ""));
  };

  const handlePress = (route: string): void => {
    // Eğer zaten o sayfadaysak işlem yapma (Performans için)
    if (isActive(route)) return;
    
    // HIZLI GEÇİŞ İÇİN: 'push' veya 'replace' yerine 'navigate' kullanıyoruz.
    router.navigate(route as never);
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 10),
            // DİNAMİK: Navbar arka plan rengi
            backgroundColor: colors.navBar, 
            // DİNAMİK: Üst çizgi rengi
            borderTopColor: colors.navBarBorder,
          },
        ]}
      >
        <View style={styles.navBar}>
          {NAV_ITEMS.map((item) => {
            const isHome = item.key === "home";
            const IconComponent = item.icon;
            const active = isActive(item.route);
            
            // --- ORTA BUTON (HOME) ---
            if (isHome) {
              return (
                <View key={item.key} style={styles.centerButtonContainer}>
                  {/* Glow Efekti - Rengi temanın accent rengine bağladık */}
                  <View 
                    style={[
                      styles.glowEffect, 
                      { backgroundColor: colors.accent } 
                    ]} 
                  />
                  
                  <TouchableOpacity
                    style={[
                      styles.scanButton,
                      {
                        // KRİTİK: Kesik (Cut-out) efekti için border rengi navbar ile aynı olmalı
                        borderColor: colors.navBar 
                      }
                    ]}
                    onPress={() => handlePress(item.route)}
                    activeOpacity={0.9} // Basma hassasiyeti
                  >
                    <LinearGradient
                      colors={[...GRADIENT.primary]} 
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.scanButtonInner}
                    >
                      <IconComponent 
                        size={30} 
                        color="#FFFFFF" 
                        strokeWidth={2.5} 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              );
            }

            // --- DİĞER BUTONLAR ---
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.navItem}
                onPress={() => handlePress(item.route)}
                activeOpacity={0.7}
              >
                {/* Arkadaki kutu kaldırıldı, sadece ikon var */}
                <View style={styles.iconContainer}>
                  <IconComponent 
                    size={24} 
                    // İkon rengi: Aktifse Pembe, Pasifse Gri
                    color={active ? colors.accent : colors.textMuted}
                    // Çizgi kalınlığı: Aktifse kalın, Pasifse ince
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: colors.textMuted },
                    // Yazı rengi: Aktifse Pembe
                    active && { color: colors.accent, fontWeight: "600" },
                  ]}
                >
                  {t(`nav.${item.key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  container: {
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingHorizontal: 8,
    height: 65,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", 
    paddingVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  // ORTA BUTON STİLLERİ
  centerButtonContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40, // Floating (Yüzme) ayarı
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.4,
    transform: [{ scale: 1.2 }],
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5, // Cut-out kalınlığı
    elevation: 10,
    shadowColor: "#fb923c",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  scanButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});