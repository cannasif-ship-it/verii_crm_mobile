import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect } from "react-native-svg";
import { Text } from "../ui/text";
import { useUIStore } from "../../store/ui";
import { GRADIENT } from "../../constants/theme";

function QRCodeIcon(): React.ReactElement {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="2" />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="2" />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="2" />
      <Rect x="5.5" y="5.5" width="2" height="2" fill="#FFFFFF" />
      <Rect x="16.5" y="5.5" width="2" height="2" fill="#FFFFFF" />
      <Rect x="5.5" y="16.5" width="2" height="2" fill="#FFFFFF" />
      <Rect x="14" y="14" width="3" height="3" fill="#FFFFFF" />
      <Rect x="18" y="14" width="3" height="3" fill="#FFFFFF" />
      <Rect x="14" y="18" width="3" height="3" fill="#FFFFFF" />
      <Rect x="18" y="18" width="3" height="3" fill="#FFFFFF" />
    </Svg>
  );
}

interface NavItem {
  key: string;
  icon: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "home", icon: "🏠", route: "/(tabs)" },
  { key: "customers", icon: "👥", route: "/(tabs)/customers" },
  { key: "scan", icon: "scan", route: "/(tabs)/scan" },
  { key: "sales", icon: "💰", route: "/(tabs)/sales" },
  { key: "activities", icon: "📅", route: "/(tabs)/activities" },
];

export function BottomNavBar(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors } = useUIStore();

  const handlePress = (route: string, isHome: boolean): void => {
    if (isHome) {
      router.replace(route as never);
    } else {
      router.push(route as never);
    }
  };

  const isActive = (route: string): boolean => {
    if (route === "/(tabs)") {
      return pathname === "/" || pathname === "/(tabs)" || pathname === "/index";
    }
    return pathname === route || pathname.startsWith(route.replace("/(tabs)", ""));
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.navBar,
          borderTopColor: colors.navBarBorder,
        },
      ]}
    >
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          const isHome = item.key === "home";
          
          if (item.key === "scan") {
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.scanButton}
                onPress={() => handlePress(item.route, false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[...GRADIENT.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.scanButtonInner}
                >
                  <QRCodeIcon />
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          const active = isActive(item.route);
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
                  active && { backgroundColor: colors.activeBackground },
                ]}
              >
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text
                style={[
                  styles.label,
                  { color: colors.textMuted },
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
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  scanButton: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  scanButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
