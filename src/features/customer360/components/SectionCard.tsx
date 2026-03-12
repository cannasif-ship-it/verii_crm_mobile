import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { Customer360SimpleItemDto } from "../types";
import { SimpleItemRow } from "./SimpleItemRow";
import {
  Contact01Icon,
  Location01Icon,
  AnalyticsUpIcon,
  Invoice03Icon,
  ShoppingBag03Icon,
  Activity01Icon,
  InformationCircleIcon,
} from "hugeicons-react-native";

interface SectionCardProps {
  title: string;
  items: Customer360SimpleItemDto[];
  colors: Record<string, string>;
  noDataKey: string;
  formatDate: (date: string | null | undefined) => string;
}

function getSectionMeta(title: string, isDark: boolean) {
  const normalized = title.toLocaleLowerCase("tr-TR");

  if (normalized.includes("iletişim") || normalized.includes("contact")) {
    return {
      Icon: Contact01Icon,
      accent: "#22C7F2",
      iconBg: isDark ? "rgba(34,199,242,0.12)" : "rgba(34,199,242,0.10)",
      iconBorder: isDark ? "rgba(34,199,242,0.24)" : "rgba(34,199,242,0.16)",
      glow: isDark
        ? ["rgba(34,199,242,0.12)", "transparent"]
        : ["rgba(34,199,242,0.07)", "transparent"],
    };
  }

  if (
    normalized.includes("teslimat") ||
    normalized.includes("adres") ||
    normalized.includes("shipping") ||
    normalized.includes("address")
  ) {
    return {
      Icon: Location01Icon,
      accent: "#10B981",
      iconBg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)",
      iconBorder: isDark ? "rgba(16,185,129,0.24)" : "rgba(16,185,129,0.16)",
      glow: isDark
        ? ["rgba(16,185,129,0.12)", "transparent"]
        : ["rgba(16,185,129,0.07)", "transparent"],
    };
  }

  if (normalized.includes("talep") || normalized.includes("demand")) {
    return {
      Icon: AnalyticsUpIcon,
      accent: "#8B5CF6",
      iconBg: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.10)",
      iconBorder: isDark ? "rgba(139,92,246,0.24)" : "rgba(139,92,246,0.16)",
      glow: isDark
        ? ["rgba(139,92,246,0.12)", "transparent"]
        : ["rgba(139,92,246,0.07)", "transparent"],
    };
  }

  if (normalized.includes("teklif") || normalized.includes("quotation")) {
    return {
      Icon: Invoice03Icon,
      accent: "#EC4899",
      iconBg: isDark ? "rgba(236,72,153,0.12)" : "rgba(236,72,153,0.10)",
      iconBorder: isDark ? "rgba(236,72,153,0.24)" : "rgba(236,72,153,0.16)",
      glow: isDark
        ? ["rgba(236,72,153,0.12)", "transparent"]
        : ["rgba(236,72,153,0.07)", "transparent"],
    };
  }

  if (normalized.includes("sipariş") || normalized.includes("order")) {
    return {
      Icon: ShoppingBag03Icon,
      accent: "#F97316",
      iconBg: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.10)",
      iconBorder: isDark ? "rgba(249,115,22,0.24)" : "rgba(249,115,22,0.16)",
      glow: isDark
        ? ["rgba(249,115,22,0.12)", "transparent"]
        : ["rgba(249,115,22,0.07)", "transparent"],
    };
  }

  if (normalized.includes("aktivite") || normalized.includes("activity")) {
    return {
      Icon: Activity01Icon,
      accent: "#14B8A6",
      iconBg: isDark ? "rgba(20,184,166,0.12)" : "rgba(20,184,166,0.10)",
      iconBorder: isDark ? "rgba(20,184,166,0.24)" : "rgba(20,184,166,0.16)",
      glow: isDark
        ? ["rgba(20,184,166,0.12)", "transparent"]
        : ["rgba(20,184,166,0.07)", "transparent"],
    };
  }

  return {
    Icon: InformationCircleIcon,
    accent: "#6366F1",
    iconBg: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.10)",
    iconBorder: isDark ? "rgba(99,102,241,0.24)" : "rgba(99,102,241,0.16)",
    glow: isDark
      ? ["rgba(99,102,241,0.12)", "transparent"]
      : ["rgba(99,102,241,0.07)", "transparent"],
  };
}

function isActivitySection(title: string): boolean {
  const normalized = title.toLocaleLowerCase("tr-TR");
  return normalized.includes("aktivite") || normalized.includes("activity");
}

export function SectionCard({
  title,
  items,
  colors,
  noDataKey,
  formatDate,
}: SectionCardProps): React.ReactElement {
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const list = items ?? [];
  const isEmpty = list.length === 0;
  const scrollable = isActivitySection(title);

  const shellBg = isDark ? "rgba(24,10,30,0.62)" : "rgba(255,247,250,0.78)";
  const shellBorder = isDark ? "rgba(236,72,153,0.14)" : "rgba(219,39,119,0.10)";
  const innerBg = isDark ? "rgba(255,255,255,0.022)" : "rgba(255,255,255,0.58)";
  const innerBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(219,39,119,0.07)";
  const titleText = isDark ? "#FFFFFF" : "#1F2937";
  const mutedText = isDark ? "rgba(255,255,255,0.56)" : "#6B7280";
  const countBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.78)";
  const countBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(219,39,119,0.10)";
  const separator = isDark ? "rgba(255,255,255,0.045)" : "rgba(15,23,42,0.05)";

  const meta = useMemo(() => getSectionMeta(title, isDark), [title, isDark]);
  const Icon = meta.Icon;

  const renderItem = useCallback(
    ({ item }: { item: Customer360SimpleItemDto }) => (
      <SimpleItemRow item={item} colors={colors} formatDate={formatDate} />
    ),
    [colors, formatDate]
  );

  const keyExtractor = useCallback(
    (item: Customer360SimpleItemDto) => String(item.id),
    []
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: shellBg,
          borderColor: shellBorder,
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

      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: meta.iconBg,
                borderColor: meta.iconBorder,
              },
            ]}
          >
            <Icon size={14} color={meta.accent} variant="stroke" />
          </View>

          <Text style={[styles.sectionTitle, { color: titleText }]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: countBg,
              borderColor: countBorder,
            },
          ]}
        >
          <Text style={[styles.sectionSubTitle, { color: mutedText }]}>
            {list.length}
          </Text>
        </View>
      </View>

      {isEmpty ? (
        <View
          style={[
            styles.emptyWrap,
            {
              backgroundColor: innerBg,
              borderColor: innerBorder,
            },
          ]}
        >
          <Text style={[styles.noData, { color: mutedText }]}>{noDataKey}</Text>
        </View>
      ) : (
        <View
          style={[
            styles.listShell,
            styles.scrollShell,
            scrollable && styles.activityShell,
            {
              backgroundColor: innerBg,
              borderColor: innerBorder,
            },
          ]}
        >
          <FlatList
            data={list}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            scrollEnabled={scrollable}
            nestedScrollEnabled={scrollable}
            showsVerticalScrollIndicator={scrollable}
            style={scrollable ? styles.activityList : undefined}
            contentContainerStyle={scrollable ? styles.activityListContent : undefined}
            ItemSeparatorComponent={() => (
              <View
                style={[
                  styles.separator,
                  {
                    backgroundColor: separator,
                  },
                ]}
              />
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 2,
    overflow: "hidden",
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  countBadge: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionSubTitle: {
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 12,
  },
  listShell: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  scrollShell: {
    minHeight: 0,
  },
  activityShell: {
    maxHeight: 300,
  },
  activityList: {
    flexGrow: 0,
  },
  activityListContent: {
    paddingVertical: 2,
  },
  separator: {
    height: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  emptyWrap: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  noData: {
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 14,
    textAlign: "center",
  },
});