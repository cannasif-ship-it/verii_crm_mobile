import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { useUIStore } from "../../../store/ui";
import { MenuCard } from "../components";

export function CustomerMenuScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const handleCustomersPress = useCallback(() => {
    router.push("/(tabs)/customers/list");
  }, [router]);

  const handleContactsPress = useCallback(() => {
    router.push("/(tabs)/customers/contacts");
  }, [router]);

  const handleShippingPress = useCallback(() => {
    router.push("/(tabs)/customers/shipping");
  }, [router]);

  const handleTitlesPress = useCallback(() => {
    router.push("/(tabs)/customers/titles");
  }, [router]);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader title={t("customerMenu.title")} showBackButton />
        <ScrollView
          style={[styles.content, { backgroundColor: contentBackground }]}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <MenuCard
            title={t("customerMenu.customers")}
            description={t("customerMenu.customersDesc")}
            icon="👥"
            onPress={handleCustomersPress}
          />
          <MenuCard
            title={t("customerMenu.contacts")}
            description={t("customerMenu.contactsDesc")}
            icon="👤"
            onPress={handleContactsPress}
          />
          <MenuCard
            title={t("customerMenu.shippingAddresses")}
            description={t("customerMenu.shippingAddressesDesc")}
            icon="📍"
            onPress={handleShippingPress}
          />
          <MenuCard
            title={t("customerMenu.titles")}
            description={t("customerMenu.titlesDesc")}
            icon="📋"
            onPress={handleTitlesPress}
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
