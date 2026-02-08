import React, { useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Pressable, 
  Dimensions, 
  Platform, 
  ScrollView,
  Image 
} from "react-native";
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

import { 
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

const LOCAL_LOGO = require("../../../assets/veriicrmlogo.png");

const { width, height } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.8;

const ACTIVE_COLOR = "#fb923c"; 
const ACTIVE_BG_COLOR = "rgba(251, 146, 60, 0.12)"; 

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function Sidebar(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  const { colors, isSidebarOpen, closeSidebar, themeMode } = useUIStore();
  const { clearAuth } = useAuthStore();

  const isAuthScreen = pathname.includes("/(auth)") || pathname === "/login";

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  const HEADER_COLOR = themeMode === "dark" ? "#f472b6" : "#be185d";

  const MENU_ITEMS = [
    { key: "home", title: t("nav.home", "Ana Sayfa"), icon: DashboardSquare01Icon, route: "/(tabs)" },

    { key: "cust_header", title: t("customerMenu.title", "MÜŞTERİ YÖNETİMİ"), isHeader: true },
    { key: "customers", title: t("customerMenu.customers", "Müşteriler"), icon: UserGroupIcon, route: "/customers" },
    { key: "contacts", title: t("customerMenu.contacts", "İletişim Kişileri"), icon: ContactIcon, route: "/customers/contacts" },
    { key: "shipping", title: t("customerMenu.shippingAddresses", "Sevkiyat Adresleri"), icon: TruckIcon, route: "/customers/shipping" },
    { key: "titles", title: t("customerMenu.titles", "Ünvanlar"), icon: LicenseIcon, route: "/customers/titles" },
    { key: "erp", title: t("customerMenu.erpCustomers", "ERP Bağlantıları"), icon: Globe02Icon, route: "/customers/erp" },

    { key: "sales_header", title: t("modules.sales", "SATIŞ & SİPARİŞ"), isHeader: true },
    { key: "orders", title: t("sales.orderList", "Sipariş Listesi"), icon: ShoppingCart01Icon, route: "/sales/orders" },
    { key: "quotations", title: t("sales.quotationList", "Teklifler"), icon: Invoice01Icon, route: "/sales/quotations" },
    { key: "demands", title: t("sales.demandList", "Talepler"), icon: Note01Icon, route: "/sales/demands" },

    { key: "stock_header", title: t("stockMenu.title", "STOK & DEPO"), isHeader: true },
    { key: "stocks", title: t("stockMenu.stockMovements", "Stok Hareketleri"), icon: PackageIcon, route: "/stock" },

    { key: "act_header", title: t("activityMenu.title", "AKTİVİTELER"), isHeader: true },
    { key: "activities", title: t("activityMenu.activities", "Tüm Aktiviteler"), icon: Calendar03Icon, route: "/activities/list" },
    { key: "dailytasks", title: t("activityMenu.dailyTasks", "Günlük Görevler"), icon: TaskDaily01Icon, route: "/activities/daily-tasks" },

    { key: "settings_header", title: t("common.settings", "SİSTEM"), isHeader: true },
    { key: "settings", title: t("common.settings", "Ayarlar"), icon: Settings01Icon, route: "/settings" },
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
    if(clearAuth) await clearAuth();
    router.replace("/(auth)/login" as never);
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
      <View style={styles.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar}>
          <AnimatedBlurView
            intensity={Platform.OS === "android" ? 50 : 20}
            tint={themeMode === "dark" ? "dark" : "light"}
            style={[StyleSheet.absoluteFill, backdropStyle]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sidebar,
            {
              width: SIDEBAR_WIDTH,
              marginTop: insets.top,
              height: sidebarHeight,
              backgroundColor: colors.background,
              borderRightColor: colors.border,
            },
            animatedStyle,
          ]}
        >
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image 
                source={LOCAL_LOGO} 
                style={styles.logo}
                resizeMode="contain" 
              />
            </View>
            
            <TouchableOpacity
              onPress={closeSidebar}
              style={[styles.closeButton, { backgroundColor: colors.card }]}
            >
              <Cancel01Icon size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={['transparent', colors.border || 'rgba(255,255,255,0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.separator}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {MENU_ITEMS.map((item, index) => {
              if (item.isHeader) {
                return (
                  <Text
                    key={`header-${index}`}
                    style={[styles.menuHeader, { color: HEADER_COLOR }]}
                  >
                    {item.title}
                  </Text>
                );
              }
              
              const isActive = pathname === item.route;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => item.route && handleNavigation(item.route)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    (pressed || isActive) && { backgroundColor: ACTIVE_BG_COLOR },
                  ]}
                >
                  {({ pressed }) => (
                    <View style={styles.menuItemInner}>
                      <View
                        style={[
                          styles.iconBox,
                          { backgroundColor: (pressed || isActive) ? "transparent" : colors.card }
                        ]}
                      >
                        {item.icon && (
                          <item.icon
                            size={20}
                            color={(pressed || isActive) ? ACTIVE_COLOR : colors.text}
                            
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.menuItemText,
                          { 
                            color: (pressed || isActive) ? ACTIVE_COLOR : colors.text,
                            fontWeight: (pressed || isActive) ? "700" : "500"
                          }
                        ]}
                      >
                        {item.title}
                      </Text>
                      <ArrowRight01Icon
                        size={16}
                        color={(pressed || isActive) ? ACTIVE_COLOR : colors.textMuted}
                        style={{ opacity: (pressed || isActive) ? 1 : 0.5 }}
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <LinearGradient
            colors={['transparent', colors.border || 'rgba(255,255,255,0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.separator, { marginTop: 0, marginBottom: 0 }]}
          />

          <View style={styles.footer}>
            <Text style={[styles.companyText, { color: colors.textMuted }]}>
              V3RII COMPANY
            </Text>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  sidebar: {
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 75,  
    paddingRight: 16, 
    paddingTop: 25,   
    paddingBottom: 4, 
    height: 80,       
  },
  logoWrapper: {
    flex: 1,
    height: "100%",
    justifyContent: "center", 
    alignItems: "center",     
    marginRight: 40, 
  },
  logo: {
    width: 225,  
    height: 125,  
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  separator: {
    height: 1,
    width: "80%", 
    alignSelf: "center",
    marginVertical: 15, 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuHeader: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: 20, 
    marginBottom: 6,
    marginLeft: 12,
    letterSpacing: 1,
  },
  menuItem: {
    marginBottom: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItemInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  companyText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    opacity: 0.5,
  },
});