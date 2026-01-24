import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Text } from "../../components/ui/text";
import { ScreenHeader } from "../../components/navigation";
import { useUIStore } from "../../store/ui";

export default function ScanScreen(): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <ScreenHeader title={t("nav.scan")} showBackButton />
        
        <View style={styles.content}>
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft, { borderColor: colors.accent }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: colors.accent }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.accent }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: colors.accent }]} />
            </View>
            <Text style={styles.scanHint}>{t("scan.alignBarcode")}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💡</Text>
              <Text style={styles.actionText}>{t("scan.flash")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>⌨️</Text>
              <Text style={styles.actionText}>{t("scan.manual")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 60,
  },
  scanArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanHint: {
    marginTop: 24,
    fontSize: 14,
    color: "#9CA3AF",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    paddingHorizontal: 40,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
});
