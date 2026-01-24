import React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Text } from "../../components/ui/text";
import { ScreenHeader } from "../../components/navigation";
import { useUIStore } from "../../store/ui";

export default function StockScreen(): React.ReactElement {
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader title={t("modules.stock")} showBackButton />
        <View style={[styles.content, { backgroundColor: contentBackground }]}>
          <Text style={styles.placeholder}>📦</Text>
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            {t("modules.stockDesc")}
          </Text>
        </View>
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
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  placeholder: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
  },
});
