import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { ActivityItem as ActivityItemType } from "../types";

interface ActivityItemProps {
  item: ActivityItemType;
}

const TYPE_ICONS: Record<string, string> = {
  receiving: "📦",
  inventory: "📋",
  transfer: "🔄",
  shipping: "🚚",
  putaway: "📍",
  picking: "✋",
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function ActivityItem({ item }: ActivityItemProps): React.ReactElement {
  const { colors, themeMode } = useUIStore();

  const containerBackground =
    themeMode === "dark" ? "rgba(20, 10, 30, 0.7)" : "#FFFFFF";

  const iconContainerBackground =
    themeMode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#F9FAFB";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: containerBackground, borderColor: colors.cardBorder },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconContainerBackground }]}>
        <Text style={styles.icon}>{TYPE_ICONS[item.type]}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {formatTime(item.timestamp)}
        </Text>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                item.status === "completed"
                  ? colors.success
                  : item.status === "pending"
                  ? colors.warning
                  : colors.error,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
  },
  meta: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 11,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
