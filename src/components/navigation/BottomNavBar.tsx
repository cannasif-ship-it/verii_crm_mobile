import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Platform, LogBox } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../ui/text";
import { useUIStore } from "../../store/ui";

// HugeIcons Importları
import { 
  PackageIcon, 
  UserGroupIcon, 
  Home01Icon, 
  Money03Icon, 
  Calendar03Icon 
} from "hugeicons-react-native";

// Hata gizleme (Key spread uyarısı için)
LogBox.ignoreLogs(['A props object containing a "key" prop is being spread']);

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
  const { colors } = useUIStore(); 

  useEffect(() => {
    LogBox.ignoreLogs(['A props object containing a "key" prop is being spread']);
  }, []);

  const isActive = (route: string): boolean => {
    if (route === "/(tabs)") {
      return pathname === "/" || pathname === "/(tabs)" || pathname === "/index";
    }
    return pathname === route || pathname.startsWith(route.replace("/(tabs)", ""));
  };

  const handlePress = (route: string, isHome: boolean): void => {
    const isCurrentlyActive = isActive(route);
    if (isCurrentlyActive) return;
    
    if (isHome) {
      router.replace(route as never);
    } else {
      router.push(route as never);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 10),
            backgroundColor: "#140a1e", 
            borderTopColor: "rgba(255, 255, 255, 0.1)",
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
                  {/* Glow Efekti */}
                  <View style={styles.glowEffect} />
                  
                  <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => handlePress(item.route, true)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#fb923c", "#db2777"]} 
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.scanButtonInner}
                    >
                      {/* DÜZELTME: variant="solid" kaldırıldı. strokeWidth artırıldı. */}
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
                onPress={() => handlePress(item.route, isHome)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    active && { backgroundColor: "rgba(251, 146, 60, 0.1)" },
                  ]}
                >
                  {/* DÜZELTME: variant="solid" yerine renk ve kalınlık değişimi */}
                  <IconComponent 
                    size={24} 
                    color={active ? "#fb923c" : "#9ca3af"} // Aktifse Turuncu, değilse Gri
                    strokeWidth={active ? 2.5 : 1.5} // Aktifse Kalın, değilse ince
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    { color: "#9ca3af" },
                    active && { color: "#fb923c", fontWeight: "600" },
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
    shadowOpacity: 0.3,
    shadowRadius: 20,
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
    borderRadius: 12,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  // ORTA BUTON
  centerButtonContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#db2777',
    opacity: 0.5,
    transform: [{ scale: 1.2 }],
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: "#140a1e",
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