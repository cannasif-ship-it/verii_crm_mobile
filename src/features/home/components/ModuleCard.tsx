import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
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
  const title = t(`home.${module.key}`);
  const description = t(`home.${module.key}Desc`);
  const color = module.color;
  const iconBgColor = themeMode === "dark" ? `${color}25` : `${color}15`;

  const handlePress = (): void => {
    onPress(module.route);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: themeMode === "dark" ? "#000" : "#000",
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Text style={styles.iconEmoji}>{module.icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 140,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
});