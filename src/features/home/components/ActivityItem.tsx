import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { ActivityItem as ActivityItemType } from "../types";

// HugeIcons Importları
import { 
  PackageIcon,          // receiving
  ClipboardIcon,        // inventory
  ArrowDataTransferHorizontalIcon,   // transfer
  TruckIcon,            // shipping
  Location01Icon,       // putaway
  HandPointingDown01Icon,   // picking
  CheckmarkCircle02Icon // fallback
} from "hugeicons-react-native";

interface ActivityItemProps {
  item: ActivityItemType;
}

// Tip eşleşmeleri için ikon haritası
const getIcon = (type: string) => {
  switch (type) {
    case 'receiving': return PackageIcon;
    case 'inventory': return ClipboardIcon;
    case 'transfer': return ArrowDataTransferHorizontalIcon;
    case 'shipping': return TruckIcon;
    case 'putaway': return Location01Icon;
    case 'picking': return HandPointingDown01Icon;
    default: return CheckmarkCircle02Icon;
  }
};

// İkon renkleri
const getIconColor = (type: string) => {
  switch (type) {
    case 'receiving': return "#3B82F6"; // Mavi
    case 'shipping': return "#F59E0B";  // Turuncu
    case 'inventory': return "#8B5CF6"; // Mor
    case 'transfer': return "#10B981";  // Yeşil
    default: return "#6B7280";          // Gri
  }
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function ActivityItem({ item }: ActivityItemProps): React.ReactElement {
  const { colors, themeMode } = useUIStore();

  const containerBackground = colors.card;
  const iconContainerBackground = themeMode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#F3F4F6";

  const IconComponent = getIcon(item.type);
  const iconColor = getIconColor(item.type);

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: containerBackground, 
          borderColor: colors.border 
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconContainerBackground }]}>
        <IconComponent size={20} color={iconColor}  />
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
    borderRadius: 16, // Daha yuvarlak köşeler
    marginBottom: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
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
    marginBottom: 6,
    fontWeight: "500",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});