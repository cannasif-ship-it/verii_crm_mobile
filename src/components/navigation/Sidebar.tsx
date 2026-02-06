import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Modal, Pressable, Dimensions, Platform, ScrollView } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { BlurView } from "expo-blur"; 
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../ui/text";
import { useUIStore } from "../../store/ui";
import { useAuthStore } from "../../store/auth";
import { GRADIENT } from "../../constants/theme";

// --- İKON IMPORTLARI ---
import { 
  Logout01Icon, 
  Cancel01Icon, 
  ArrowRight01Icon,
  DashboardSquare01Icon, 
  Settings01Icon,        
  UserGroupIcon,         
  ContactIcon,           
  TruckIcon,           
  LicenseIcon,           
  Globe02Icon,           
  ShoppingCart01Icon,    
  Invoice01Icon,         
  Note01Icon,            
  PackageIcon,           
  Calendar03Icon,        
  TaskDaily01Icon        
} from "hugeicons-react-native";

const { width, height } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.8;

// Turuncu (Aktif Eleman)
const ACTIVE_COLOR = "#fb923c"; 
const ACTIVE_BG_COLOR = "rgba(251, 146, 60, 0.12)"; 

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function Sidebar(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  // themeMode eklendi
  const { colors, isSidebarOpen, closeSidebar, themeMode } = useUIStore();
  const { user, clearAuth } = useAuthStore();

  const isAuthScreen = pathname.includes("/(auth)") || pathname === "/login";

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  // BAŞLIK RENGİ AYARI (Pembe Tonları)
  // Dark: Açık Pembe (#f472b6) | Light: Koyu Pembe/Vişne (#be185d)
  const HEADER_COLOR = themeMode === "dark" ? "#f472b6" : "#be185d";

  const MENU_ITEMS = [
    { key: "home", title: t("nav.home"), icon: DashboardSquare01Icon, route: "/(tabs)" },

    { key: "cust_header", title: t("customerMenu.title"), isHeader: true },
    { key: "customers", title: t("customerMenu.customers"), icon: UserGroupIcon, route: "/customers" },
    { key: "contacts", title: t("customerMenu.contacts"), icon: ContactIcon, route: "/customers/contacts" },
    { key: "shipping", title: t("customerMenu.shippingAddresses"), icon: TruckIcon, route: "/customers/shipping" },
    { key: "titles", title: t("customerMenu.titles"), icon: LicenseIcon, route: "/customers/titles" },
    { key: "erp", title: t("customerMenu.erpCustomers"), icon: Globe02Icon, route: "/customers/erp" },

    { key: "sales_header", title: t("modules.sales"), isHeader: true },
    { key: "orders", title: t("sales.orderList"), icon: ShoppingCart01Icon, route: "/sales/orders" },
    { key: "quotations", title: t("sales.quotationList"), icon: Invoice01Icon, route: "/sales/quotations" },
    { key: "demands", title: t("sales.demandList"), icon: Note01Icon, route: "/sales/demands" },

    { key: "stock_header", title: t("stockMenu.title"), isHeader: true },
    { key: "stocks", title: t("stockMenu.stockMovements"), icon: PackageIcon, route: "/stock" },

    { key: "act_header", title: t("activityMenu.title"), isHeader: true },
    { key: "activities", title: t("activityMenu.activities"), icon: Calendar03Icon, route: "/activities/list" },
    { key: "dailytasks", title: t("activityMenu.dailyTasks"), icon: TaskDaily01Icon, route: "/activities/daily-tasks" },

    { key: "settings_header", title: t("common.settings"), isHeader: true },
    { key: "settings", title: t("common.settings"), icon: Settings01Icon, route: "/settings" },
  ];

  useEffect(() => {
    if (isSidebarOpen) {
      translateX.value = withTiming(0, { 
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { 
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isSidebarOpen]);

  const handleNavigation = (route: string) => {
    closeSidebar();
    setTimeout(() => {
      router.push(route as never);
    }, 150);
  };

  const handleLogout = async () => {
    closeSidebar();
    await clearAuth();
    router.replace("/(auth)/login" as never);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!isSidebarOpen) return <View />;
  if (isAuthScreen) return <View />;

  const sidebarHeight = height - insets.top;

  return (
    <Modal
      transparent
      visible={isSidebarOpen}
      animationType="none"
      onRequestClose={closeSidebar}
      statusBarTranslucent
    >
      <View className="flex-1 justify-start">
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar}>
          <AnimatedBlurView
            intensity={Platform.OS === "android" ? 100 : 30}
            tint="dark"
            style={[StyleSheet.absoluteFill, backdropStyle]}
          />
        </Pressable>

        <Animated.View
          style={[
            {
              width: SIDEBAR_WIDTH,
              marginTop: insets.top,
              height: sidebarHeight,
              backgroundColor: colors.background,
              borderRightColor: colors.border,
              borderRightWidth: 1,
              borderTopRightRadius: 24,
              borderBottomRightRadius: 0,
              shadowColor: "#000",
              shadowOffset: { width: 5, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 20,
              overflow: "hidden",
              justifyContent: "space-between",
            },
            animatedStyle,
          ]}
        >
          <View className="flex-row items-center justify-between px-4 pt-6 pb-5">
            <View className="flex-row items-center flex-1 mr-2 min-w-0">
              <LinearGradient
                colors={GRADIENT.primary}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text className="text-white text-base font-bold">
                  {getInitials(user?.name || "")}
                </Text>
              </LinearGradient>
              <View className="flex-1 justify-center min-w-0">
                <Text
                  className="text-base font-bold mb-0.5"
                  style={{ color: colors.text }}
                  numberOfLines={1}
                >
                  {user?.name || t("common.guest", "Misafir")}
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                  numberOfLines={1}
                >
                  {user?.email || ""}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeSidebar}
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.card }}
            >
              <Cancel01Icon size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View className="h-px w-full opacity-10" style={{ backgroundColor: colors.border }} />

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {MENU_ITEMS.map((item, index) => {
              if (item.isHeader) {
                return (
                  <Text
                    key={`header-${index}`}
                    className="text-xs font-extrabold uppercase mt-6 mb-2 ml-3 tracking-wider"
                    style={{ color: HEADER_COLOR }}
                  >
                    {item.title}
                  </Text>
                );
              }
              return (
                <Pressable
                  key={item.key}
                  onPress={() => item.route && handleNavigation(item.route)}
                  style={({ pressed }) => [
                    { marginBottom: 4, borderRadius: 12, overflow: "hidden" },
                    pressed && { backgroundColor: ACTIVE_BG_COLOR },
                  ]}
                >
                  {({ pressed }) => (
                    <View className="flex-row items-center py-3 px-3">
                      <View
                        className="w-9 h-9 rounded-[10px] items-center justify-center mr-3.5"
                        style={{
                          backgroundColor: pressed ? "transparent" : colors.card,
                        }}
                      >
                        {item.icon && (
                          <item.icon
                            size={20}
                            color={pressed ? ACTIVE_COLOR : colors.text}
                            strokeWidth={pressed ? 2.5 : 1.5}
                          />
                        )}
                      </View>
                      <Text
                        className="flex-1 text-[15px]"
                        style={{
                          color: pressed ? ACTIVE_COLOR : colors.text,
                          fontWeight: pressed ? "700" : "500",
                        }}
                      >
                        {item.title}
                      </Text>
                      <ArrowRight01Icon
                        size={16}
                        color={pressed ? ACTIVE_COLOR : colors.textMuted}
                        style={{ opacity: pressed ? 1 : 0.5, marginLeft: "auto" }}
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="h-px w-full opacity-10" style={{ backgroundColor: colors.border }} />

          <View
            className="px-4 pt-2.5"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            <Pressable
              style={({ pressed }) => [
                { marginBottom: 4, borderRadius: 12, overflow: "hidden" },
                pressed && { backgroundColor: "rgba(239, 68, 68, 0.1)" },
              ]}
              onPress={handleLogout}
            >
              <View className="flex-row items-center py-3 px-3">
                <View
                  className="w-9 h-9 rounded-[10px] items-center justify-center mr-3.5"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                >
                  <Logout01Icon size={20} color="#EF4444" />
                </View>
                <Text className="flex-1 text-[15px] font-semibold text-app-error">
                  {t("auth.logout", "Çıkış Yap")}
                </Text>
              </View>
            </Pressable>
            <Text
              className="text-center text-[11px] mt-2.5 opacity-40"
              style={{ color: colors.textMuted }}
            >
              V3RII COMP.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
