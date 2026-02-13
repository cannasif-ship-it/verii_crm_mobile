import React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import {
  PackageIcon,
  TruckIcon,
  Task01Icon,
} from "hugeicons-react-native";

interface StatsStripProps {
  todayReceiving: number;
  todayShipping: number;
  pendingTasks: number;
}

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  isDark: boolean;
}

function StatItem({ icon: Icon, value, label, color, isDark }: StatItemProps): React.ReactElement {
  
  // Premium Renk Paleti Ayarları
  const bgColors = isDark 
    ? ["#161229", "#0F0B1E"] as const // Dark Gradient
    : ["#FFFFFF", "#FFFFFF"] as const; // Light Solid

  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const iconBg = isDark ? "rgba(255,255,255,0.06)" : color + "15";

  return (
    <LinearGradient
        colors={[...bgColors]}
        style={[styles.statCard, { borderColor }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Icon size={20} color={color} strokeWidth={2.5} />
      </View>
      <View>
        <Text style={[styles.value, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>
          {value}
        </Text>
        <Text style={[styles.label, { color: isDark ? "#94A3B8" : "#64748B" }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </LinearGradient>
  );
}

export function StatsStrip({ todayReceiving, todayShipping, pendingTasks }: StatsStripProps): React.ReactElement {
  const { t } = useTranslation();
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  return (
    <View style={styles.container}>
      <StatItem
        icon={PackageIcon}
        value={todayReceiving}
        label={t("home.todayReceiving", "Bugün Giriş")}
        color="#3B82F6" // Blue
        isDark={isDark}
      />
      <StatItem
        icon={TruckIcon}
        value={todayShipping}
        label={t("home.todayShipping", "Bugün Çıkış")}
        color="#F59E0B" // Amber
        isDark={isDark}
      />
      <StatItem
        icon={Task01Icon}
        value={pendingTasks}
        label={t("home.pendingTasks", "Bekleyen")}
        color="#EC4899" // Pink
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 105,
    justifyContent: "space-between",
    elevation: 1, // Hafif gölge
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});