import React from "react";
import { View } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { ActivityItem as ActivityItemType } from "../types";
import {
  PackageIcon,
  ClipboardIcon,
  ArrowDataTransferHorizontalIcon,
  TruckIcon,
  Location01Icon,
  HandPointingDown01Icon,
  CheckmarkCircle02Icon,
} from "hugeicons-react-native";

interface ActivityItemProps {
  item: ActivityItemType;
}

const getIcon = (type: string) => {
  switch (type) {
    case "receiving":
      return PackageIcon;
    case "inventory":
      return ClipboardIcon;
    case "transfer":
      return ArrowDataTransferHorizontalIcon;
    case "shipping":
      return TruckIcon;
    case "putaway":
      return Location01Icon;
    case "picking":
      return HandPointingDown01Icon;
    default:
      return CheckmarkCircle02Icon;
  }
};

const getIconColor = (type: string): string => {
  switch (type) {
    case "receiving":
      return "#3B82F6";
    case "shipping":
      return "#F59E0B";
    case "inventory":
      return "#8B5CF6";
    case "transfer":
      return "#10B981";
    default:
      return "#6B7280";
  }
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityItem({ item }: ActivityItemProps): React.ReactElement {
  const { colors } = useUIStore();
  const IconComponent = getIcon(item.type);
  const iconColor = getIconColor(item.type);
  const statusColor =
    item.status === "completed"
      ? colors.success
      : item.status === "pending"
        ? colors.warning
        : colors.error;

  return (
    <View className="flex-row items-center rounded-2xl mb-3 border border-app-border dark:border-app-borderDark bg-app-card dark:bg-app-cardDark overflow-hidden">
      <View className="w-11 h-11 rounded-xl items-center justify-center ml-4 my-3.5 mr-3.5 bg-app-backgroundSecondary dark:bg-white/5">
        <IconComponent size={20} color={iconColor} />
      </View>
      <View className="flex-1 min-w-0 py-3.5 pr-4">
        <Text
          className="text-[14px] font-semibold text-app-text dark:text-app-textDark mb-0.5"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          className="text-[12px] leading-4 text-app-textSecondary dark:text-app-textSecondaryDark"
          numberOfLines={1}
        >
          {item.description}
        </Text>
      </View>
      <View className="items-end justify-center pr-4 py-3.5">
        <Text className="text-[11px] text-app-textMuted dark:text-app-textMutedDark mb-1.5">
          {formatTime(item.timestamp)}
        </Text>
        <View
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: statusColor }}
        />
      </View>
    </View>
  );
}
