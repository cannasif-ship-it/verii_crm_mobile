import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { Module } from "../types";
import {
  UserGroupIcon,
  Calendar03Icon,
  Money03Icon,
  PackageIcon,
} from "hugeicons-react-native";

const ACCENT = "#E84855";

const MODULE_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  customers: UserGroupIcon,
  activities: Calendar03Icon,
  sales: Money03Icon,
  stock: PackageIcon,
};

interface ModuleCardProps {
  module: Module;
  onPress: (route: string) => void;
  isPrimary?: boolean;
}

export function ModuleCard({ module, onPress, isPrimary = false }: ModuleCardProps): React.ReactElement {
  const { t } = useTranslation();
  const { themeMode } = useUIStore();
  const title = t(`modules.${module.key}`);
  const description = t(`modules.${module.key}Desc`);
  const IconComponent = MODULE_ICONS[module.key];
  const iconColor = isPrimary ? ACCENT : (themeMode === "dark" ? "#94A3B8" : "#6B7280");
  const iconBg = themeMode === "dark" ? "rgba(255,255,255,0.06)" : "#F3F4F6";

  const handlePress = (): void => {
    onPress(module.route);
  };

  return (
    <TouchableOpacity
      className="flex-row items-center rounded-2xl py-4 px-4 mb-3 border border-app-cardBorder dark:border-app-cardBorderDark bg-app-card dark:bg-app-cardDark active:opacity-90"
      onPress={handlePress}
      activeOpacity={0.88}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: iconBg }}
      >
        {IconComponent ? (
          <IconComponent size={24} color={iconColor} />
        ) : (
          <Text className="text-xl">{module.icon}</Text>
        )}
      </View>
      <View className="flex-1 min-w-0">
        <Text
          className="text-[15px] font-semibold text-app-text dark:text-app-textDark mb-0.5"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="text-[12px] leading-4 text-app-textSecondary dark:text-app-textSecondaryDark"
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
      <Text className="text-app-textMuted dark:text-app-textMutedDark text-lg ml-2">›</Text>
    </TouchableOpacity>
  );
}
