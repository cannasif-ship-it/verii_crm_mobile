import React from "react";
import { RefreshControl, Platform, StyleSheet, View, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "./ui/text";
import { useUIStore } from "../store/ui";

interface CustomRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export function CustomRefreshControl({
  refreshing,
  onRefresh,
}: CustomRefreshControlProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();

  const progressBackgroundColor = themeMode === "dark" ? "#1a0b2e" : "#FFFFFF";

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.accent}
      colors={[colors.accent, colors.accentSecondary, colors.accentTertiary]}
      progressBackgroundColor={progressBackgroundColor}
      title={Platform.OS === "ios" ? t("common.refreshing") : undefined}
      titleColor={Platform.OS === "ios" ? colors.textSecondary : undefined}
      progressViewOffset={Platform.OS === "android" ? 10 : 0}
    />
  );
}

interface RefreshOverlayProps {
  visible: boolean;
}

export function RefreshOverlay({ visible }: RefreshOverlayProps): React.ReactElement | null {
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: themeMode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)" }]}>
      <View style={[styles.loaderContainer, { backgroundColor: themeMode === "dark" ? "#1a0b2e" : "#FFFFFF" }]}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loaderText, { color: colors.textSecondary }]}>{t("common.refreshing")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    alignItems: "center",
    zIndex: 100,
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
