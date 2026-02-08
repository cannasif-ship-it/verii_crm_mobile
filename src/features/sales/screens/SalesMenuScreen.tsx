import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { MenuCard } from "../../customer/components"; // Yeni Pembe MenuCard
import { Text } from "../../../components/ui/text"; // Başlıklar için

// --- PROFESYONEL İKONLAR ---
import { 
  PlusSignIcon, 
  Files01Icon,          // Liste / Belge
  HourglassIcon,        // Bekleyen Onay
  Invoice01Icon,        // Teklif
  ShoppingBag01Icon,    // Sipariş
  NoteIcon,             // Talep
  ChartLineData01Icon,  // KPI / Grafik
  ArrowRight01Icon 
} from "hugeicons-react-native";

export function SalesMenuScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Store Verileri
  const { colors, themeMode } = useUIStore() as any;
  const insets = useSafeAreaInsets();
  const isDark = themeMode === "dark";

  // --- TEMA RENKLERİ ---
  const THEME_PINK = "#ec4899"; // Neon Pembe
  const headerBg = isDark ? (colors?.header || "#1E293B") : "#FFFFFF";
  const contentBg = isDark ? (colors?.background || "#0f0518") : "#F8F9FA";
  const arrowColor = isDark ? "#64748B" : "#9CA3AF";
  
  // Bölüm Başlığı Rengi
  const sectionTitleColor = isDark ? "#94A3B8" : "#6B7280";

  // --- YÖNLENDİRMELER ---
  const handleCreateQuotationPress = useCallback(() => router.push("/(tabs)/sales/quotations/create"), [router]);
  const handleQuotationListPress = useCallback(() => router.push("/(tabs)/sales/quotations"), [router]);
  const handleWaitingApprovalsPress = useCallback(() => router.push("/(tabs)/sales/quotations/waiting-approvals"), [router]);

  const handleCreateDemandPress = useCallback(() => router.push("/(tabs)/sales/demands/create"), [router]);
  const handleDemandListPress = useCallback(() => router.push("/(tabs)/sales/demands"), [router]);
  const handleDemandWaitingApprovalsPress = useCallback(() => router.push("/(tabs)/sales/demands/waiting-approvals"), [router]);

  const handleCreateOrderPress = useCallback(() => router.push("/(tabs)/sales/orders/create"), [router]);
  const handleOrderListPress = useCallback(() => router.push("/(tabs)/sales/orders"), [router]);
  const handleOrderWaitingApprovalsPress = useCallback(() => router.push("/(tabs)/sales/orders/waiting-approvals"), [router]);

  const handleSalesKpiPress = useCallback(() => router.push("/(tabs)/sales/sales-kpi"), [router]);

  // --- İKON HELPER (Kod tekrarını önlemek için) ---
  const renderIcon = (IconComponent: any) => (
    <IconComponent 
      size={24} 
      color={THEME_PINK} 
      variant="stroke" 
      strokeWidth={1.5} 
    />
  );

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={headerBg} />
      
      <View style={[styles.container, { backgroundColor: headerBg }]}>
        <ScreenHeader title={t("modules.sales")} showBackButton />
        
        <ScrollView
          style={[styles.content, { backgroundColor: contentBg }]}
          contentContainerStyle={[
            styles.contentContainer, 
            { paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          
          {/* --- BÖLÜM: TEKLİFLER (QUOTATIONS) --- */}
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{t("sales.quotations", "Teklifler")}</Text>
          
          <MenuCard
            title={t("sales.createQuotation")}
            description={t("sales.createQuotationDesc")}
            icon={renderIcon(PlusSignIcon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleCreateQuotationPress}
          />
          <MenuCard
            title={t("sales.quotationList")}
            description={t("sales.quotationListDesc")}
            icon={renderIcon(Invoice01Icon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleQuotationListPress}
          />
          <MenuCard
            title={t("sales.waitingApprovals")}
            description={t("sales.waitingApprovalsDesc")}
            icon={renderIcon(HourglassIcon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleWaitingApprovalsPress}
          />

          {/* --- BÖLÜM: SİPARİŞLER (ORDERS) --- */}
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{t("sales.orders", "Siparişler")}</Text>

          <MenuCard
            title={t("sales.createOrder")}
            description={t("sales.createOrderDesc")}
            icon={renderIcon(PlusSignIcon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleCreateOrderPress}
          />
          <MenuCard
            title={t("sales.orderList")}
            description={t("sales.orderListDesc")}
            icon={renderIcon(ShoppingBag01Icon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleOrderListPress}
          />
          <MenuCard
            title={t("sales.orderWaitingApprovals")}
            description={t("sales.orderWaitingApprovalsDesc")}
            icon={renderIcon(HourglassIcon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleOrderWaitingApprovalsPress}
          />

          {/* --- BÖLÜM: TALEPLER (DEMANDS) --- */}
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{t("sales.demands", "Talepler")}</Text>

          <MenuCard
            title={t("sales.createDemand")}
            description={t("sales.createDemandDesc")}
            icon={renderIcon(PlusSignIcon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleCreateDemandPress}
          />
          <MenuCard
            title={t("sales.demandList")}
            description={t("sales.demandListDesc")}
            icon={renderIcon(NoteIcon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleDemandListPress}
          />
          <MenuCard
            title={t("sales.demandWaitingApprovals")}
            description={t("sales.demandWaitingApprovalsDesc")}
            icon={renderIcon(HourglassIcon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleDemandWaitingApprovalsPress}
          />
<Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>{t("sales.demands", "KPI")}</Text>
                    {/* --- KPI / RAPORLAR --- */}
          <MenuCard
            title={t("salesman360.title")}
            description={t("salesman360.subtitle")}
            icon={renderIcon(ChartLineData01Icon)}
            rightIcon={<ArrowRight01Icon size={20} color={arrowColor} />}
            onPress={handleSalesKpiPress}
          />

        </ScrollView>
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
    // Modern Bottom Sheet görünümü (Diğer sayfalarla uyumlu: 32)
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 24, // Biraz daha yukarı aldım
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  }
});