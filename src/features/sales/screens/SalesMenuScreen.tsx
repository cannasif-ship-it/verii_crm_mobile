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
