import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import {
  AnalyticsUpIcon,
  Invoice03Icon,
  ShoppingBag03Icon,
  Activity01Icon,
  ChartAverageIcon,
} from "hugeicons-react-native";

interface KpiCardProps {
  label: string;
  value: number;
  colors: Record<string, string>;
}

function pickKpiMeta(label: string, isDark: boolean) {
  const normalized = label.toLocaleLowerCase("tr-TR");

  if (normalized.includes("talep")) {
    return {
      Icon: AnalyticsUpIcon,
      iconColor: "#8B5CF6",
      iconBg: isDark ? "rgba(139,92,246,0.14)" : "rgba(139,92,246,0.10)",
      iconBorder: isDark ? "rgba(139,92,246,0.26)" : "rgba(139,92,246,0.18)",
      glow: isDark
        ? ["rgba(139,92,246,0.18)", "transparent"]
        : ["rgba(139,92,246,0.10)", "transparent"],
    };
  }

  if (normalized.includes("teklif")) {
    return {
      Icon: Invoice03Icon,
      iconColor: "#EC4899",
      iconBg: isDark ? "rgba(236,72,153,0.14)" : "rgba(236,72,153,0.10)",
      iconBorder: isDark ? "rgba(236,72,153,0.26)" : "rgba(236,72,153,0.18)",
      glow: isDark
        ? ["rgba(236,72,153,0.18)", "transparent"]
        : ["rgba(236,72,153,0.10)", "transparent"],
    };
  }

  if (normalized.includes("sipariş")) {
    return {
      Icon: ShoppingBag03Icon,
      iconColor: "#F97316",
      iconBg: isDark ? "rgba(249,115,22,0.14)" : "rgba(249,115,22,0.10)",
      iconBorder: isDark ? "rgba(249,115,22,0.26)" : "rgba(249,115,22,0.18)",
      glow: isDark
        ? ["rgba(249,115,22,0.18)", "transparent"]
        : ["rgba(249,115,22,0.10)", "transparent"],
    };
  }

  if (normalized.includes("aktivite")) {
    return {
      Icon: Activity01Icon,
      iconColor: "#10B981",
      iconBg: isDark ? "rgba(16,185,129,0.14)" : "rgba(16,185,129,0.10)",
      iconBorder: isDark ? "rgba(16,185,129,0.26)" : "rgba(16,185,129,0.18)",
      glow: isDark
        ? ["rgba(16,185,129,0.18)", "transparent"]
        : ["rgba(16,185,129,0.10)", "transparent"],
    };
  }

  return {
    Icon: ChartAverageIcon,
    iconColor: "#06B6D4",
    iconBg: isDark ? "rgba(6,182,212,0.14)" : "rgba(6,182,212,0.10)",
    iconBorder: isDark ? "rgba(6,182,212,0.26)" : "rgba(6,182,212,0.18)",
    glow: isDark
      ? ["rgba(6,182,212,0.18)", "transparent"]
      : ["rgba(6,182,212,0.10)", "transparent"],
  };
}

export function KpiCard({ label, value, colors }: KpiCardProps): React.ReactElement {
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const cardBg = isDark ? "rgba(19,11,27,0.72)" : "rgba(255,245,248,0.84)";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(219,39,119,0.08)";
  const labelColor = isDark ? "rgba(255,255,255,0.56)" : "#6B7280";
  const valueColor = isDark ? "#FFFFFF" : "#1F2937";

  const meta = useMemo(() => pickKpiMeta(label, isDark), [label, isDark]);
  const Icon = meta.Icon;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
      ]}
    >
      <View style={styles.glowLayer}>
        <LinearGradient
          colors={meta.glow as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: meta.iconBg,
              borderColor: meta.iconBorder,
            },
          ]}
        >
          <Icon size={15} color={meta.iconColor} variant="stroke" />
        </View>

        <View
          style={[
            styles.pulseDot,
            {
              backgroundColor: meta.iconColor,
            },
          ]}
        />
      </View>

      <Text style={[styles.label, { color: labelColor }]} numberOfLines={2}>
        {label}
      </Text>

      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 102,
    minHeight: 104,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconWrap: {
    width: 31,
    height: 31,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    opacity: 0.9,
  },
  label: {
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 13,
    minHeight: 26,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: -0.6,
  },
});