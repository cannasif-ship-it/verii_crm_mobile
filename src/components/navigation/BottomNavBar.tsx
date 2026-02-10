import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text } from "../ui/text";
import { useUIStore } from "../../store/ui";
import {
  PackageIcon,
  UserGroupIcon,
  Home01Icon,
  Money03Icon,
  Calendar03Icon,
} from "hugeicons-react-native";

interface NavItem {
  key: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
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
  const { colors, themeMode } = useUIStore();

  const isDark = themeMode === "dark";

  // --- TEMA AYARLARI ---
  const THEME = {
    bg: isDark ? "#0f0518" : colors.navBar || "#FFFFFF",
    
    // AYDINLIK MOD DÜZELTMESİ:
    // Koyu modda silik beyaz, aydınlık modda ise daha belirgin bir gri (#CBD5E1) kullandık.
    borderTop: isDark ? "rgba(255,255,255,0.1)" : "#CBD5E1", 
    
    activeColor: "#db2777", 
    inactiveColor: isDark ? "#94a3b8" : colors.textSecondary,
    
    // Aydınlık modda gölgeyi biraz daha belirgin yapalım
    shadowOpacity: isDark ? 0.1 : 0.08, 
  };

  const isActive = (route: string): boolean => {
    if (route === "/(tabs)") {
      return pathname === "/" || pathname === "/(tabs)" || pathname === "/index";
    }
    return pathname === route || pathname.startsWith(route.replace("/(tabs)", ""));
  };

  const handlePress = (route: string): void => {
    if (isActive(route)) {
      return;
    }
    router.replace(route as never);
  };

  const paddingBottom = Platform.OS === "ios" ? insets.bottom : Math.max(insets.bottom, 12);

  return (
    <View 
      style={[
        styles.wrapper, 
        { 
          backgroundColor: THEME.bg,
          borderTopColor: THEME.borderTop,
          shadowOpacity: THEME.shadowOpacity, // Dinamik gölge opaklığı
        }
      ]}
    > 
      <View
        style={[
          styles.container,
          {
            paddingBottom,
            backgroundColor: THEME.bg, 
          },
        ]}
      >
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.route);
          const iconColor = active ? THEME.activeColor : THEME.inactiveColor;

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => handlePress(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.iconRow}>
                {active && (
                   <View style={[styles.activeIndicator, { backgroundColor: THEME.activeColor }]} />
                )}
                
                <View style={styles.iconContainer}>
                  <IconComponent
                    size={24}
                    color={iconColor}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                </View>
              </View>
              <Text
                style={[
                  styles.label,
                  { color: iconColor },
                  active && styles.labelActive,
                ]}
              >
                {t(`nav.${item.key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    
    // Border (Üst Çizgi)
    borderTopWidth: 1, 
    
    // Gölge (Sayfadan ayırma efekti)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 }, // Gölgeyi yukarı doğru verdik
    shadowRadius: 6,
    elevation: 10, // Android için daha yüksek elevation
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 12,
    paddingHorizontal: 8,
    minHeight: 60,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: "absolute",
    top: -12, 
    width: 32, 
    height: 3,
    borderRadius: 1.5,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
  labelActive: {
    fontWeight: "700",
  },
});