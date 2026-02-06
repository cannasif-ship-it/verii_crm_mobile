import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { MenuCard } from "../../customer/components";

export function SalesMenuScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const handleWaitingApprovalsPress = useCallback(() => {
    router.push("/(tabs)/sales/quotations/waiting-approvals");
  }, [router]);

  const handleQuotationListPress = useCallback(() => {
    router.push("/(tabs)/sales/quotations");
  }, [router]);

  const handleCreateQuotationPress = useCallback(() => {
    router.push("/(tabs)/sales/quotations/create");
  }, [router]);

  const handleDemandListPress = useCallback(() => {
    router.push("/(tabs)/sales/demands");
  }, [router]);

  const handleCreateDemandPress = useCallback(() => {
    router.push("/(tabs)/sales/demands/create");
  }, [router]);

  const handleDemandWaitingApprovalsPress = useCallback(() => {
    router.push("/(tabs)/sales/demands/waiting-approvals");
  }, [router]);

  const handleOrderListPress = useCallback(() => {
    router.push("/(tabs)/sales/orders");
  }, [router]);

  const handleCreateOrderPress = useCallback(() => {
    router.push("/(tabs)/sales/orders/create");
  }, [router]);

  const handleOrderWaitingApprovalsPress = useCallback(() => {
    router.push("/(tabs)/sales/orders/waiting-approvals");
  }, [router]);

  const handleSalesKpiPress = useCallback(() => {
    router.push("/(tabs)/sales/sales-kpi");
  }, [router]);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader title={t("modules.sales")} showBackButton />
        <ScrollView
          style={[styles.content, { backgroundColor: contentBackground }]}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <MenuCard
            title={t("sales.createQuotation")}
            description={t("sales.createQuotationDesc")}
            icon="➕"
            onPress={handleCreateQuotationPress}
          />
          <MenuCard
            title={t("sales.quotationList")}
            description={t("sales.quotationListDesc")}
            icon="📋"
            onPress={handleQuotationListPress}
          />
          <MenuCard
            title={t("sales.waitingApprovals")}
            description={t("sales.waitingApprovalsDesc")}
            icon="⏳"
            onPress={handleWaitingApprovalsPress}
          />
          <MenuCard
            title={t("sales.createDemand")}
            description={t("sales.createDemandDesc")}
            icon="➕"
            onPress={handleCreateDemandPress}
          />
          <MenuCard
            title={t("sales.demandList")}
            description={t("sales.demandListDesc")}
            icon="📋"
            onPress={handleDemandListPress}
          />
          <MenuCard
            title={t("sales.demandWaitingApprovals")}
            description={t("sales.demandWaitingApprovalsDesc")}
            icon="⏳"
            onPress={handleDemandWaitingApprovalsPress}
          />
          <MenuCard
            title={t("sales.createOrder")}
            description={t("sales.createOrderDesc")}
            icon="➕"
            onPress={handleCreateOrderPress}
          />
          <MenuCard
            title={t("sales.orderList")}
            description={t("sales.orderListDesc")}
            icon="📋"
            onPress={handleOrderListPress}
          />
          <MenuCard
            title={t("sales.orderWaitingApprovals")}
            description={t("sales.orderWaitingApprovalsDesc")}
            icon="⏳"
            onPress={handleOrderWaitingApprovalsPress}
          />
          <MenuCard
            title={t("salesman360.title")}
            description={t("salesman360.subtitle")}
            icon="📊"
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 20,
  },
});
