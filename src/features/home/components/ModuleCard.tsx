import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { Module } from "../types";

interface ModuleCardProps {
  module: Module;
  onPress: (route: string) => void;
}

export function ModuleCard({ module, onPress }: ModuleCardProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();

  const cardBackgroundColor =
    themeMode === "dark" ? "rgba(20, 10, 30, 0.7)" : "#FFFFFF";

  const iconBackgroundColor =
    themeMode === "dark" ? `${module.color}25` : `${module.color}15`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: cardBackgroundColor,
          borderColor: colors.cardBorder,
          shadowColor: themeMode === "dark" ? "#000" : "#000",
        },
      ]}
      onPress={() => onPress(module.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        <Text style={styles.icon}>{module.icon}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {t(`modules.${module.key}`)}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t(`modules.${module.key}Desc`)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    margin: 6,
    minHeight: 140,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
});
