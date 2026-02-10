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
  const { colors } = useUIStore();

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

  const paddingBottom = Platform.OS === "ios" ? insets.bottom : Math.max(insets.bottom, 10);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.navBar }]}> 
      <View
        style={[
          styles.container,
          {
            paddingBottom,
            backgroundColor: colors.navBar,
            borderTopColor: colors.navBarBorder,
          },
        ]}
      >
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => handlePress(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.iconRow}>
                <View
                  style={[
                    styles.activeIndicator,
                    active && { backgroundColor: colors.accent },
                  ]}
                />
                <View style={styles.iconContainer}>
                  <IconComponent
                    size={22}
                    color={active ? colors.accent : colors.textSecondary}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                </View>
              </View>
              <Text
                style={[
                  styles.label,
                  { color: active ? colors.accent : colors.textSecondary },
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
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 4,
    minHeight: 56,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  iconRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  activeIndicator: {
    position: "absolute",
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
  },
  labelActive: {
    fontWeight: "600",
  },
});
