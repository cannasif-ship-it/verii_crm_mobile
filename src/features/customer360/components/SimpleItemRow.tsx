import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import {
  Calendar03Icon,
  Tag01Icon,
  BotIcon,
} from "hugeicons-react-native";
import type { Customer360SimpleItemDto } from "../types";

interface SimpleItemRowProps {
  item: Customer360SimpleItemDto;
  colors: Record<string, string>;
  formatDate: (date: string | null | undefined) => string;
}

function getStatusMeta(status: string, isDark: boolean) {
  const normalized = status.toLocaleLowerCase("tr-TR");

  if (
    normalized.includes("onay") ||
    normalized.includes("approved") ||
    normalized.includes("tamam")
  ) {
    return {
      text: "#10B981",
      bg: isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.10)",
      border: isDark ? "rgba(16,185,129,0.22)" : "rgba(16,185,129,0.16)",
    };
  }

  if (
    normalized.includes("bekle") ||
    normalized.includes("pending") ||
    normalized.includes("taslak")
  ) {
    return {
      text: "#F59E0B",
      bg: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.10)",
      border: isDark ? "rgba(245,158,11,0.22)" : "rgba(245,158,11,0.16)",
    };
  }

  if (
    normalized.includes("red") ||
    normalized.includes("iptal") ||
    normalized.includes("cancel") ||
    normalized.includes("fail")
  ) {
    return {
      text: "#EF4444",
      bg: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.10)",
      border: isDark ? "rgba(239,68,68,0.22)" : "rgba(239,68,68,0.16)",
    };
  }

  return {
    text: isDark ? "rgba(255,255,255,0.70)" : "#475569",
    bg: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
  };
}

export function SimpleItemRow({
  item,
  colors,
  formatDate,
}: SimpleItemRowProps): React.ReactElement {
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const titleText = isDark ? "#F8FAFC" : "#1F2937";
  const mutedText = isDark ? "rgba(255,255,255,0.56)" : "#6B7280";
  const softText = isDark ? "rgba(255,255,255,0.42)" : "#94A3B8";
  const accent = isDark ? "#EC4899" : "#DB2777";

  const dateStr = item.date ? formatDate(item.date) : null;
  const hasSubtitle = !!item.subtitle?.trim();
  const hasStatus = item.status != null && item.status !== "";
  const statusMeta = useMemo(
    () => (hasStatus ? getStatusMeta(String(item.status), isDark) : null),
    [item.status, isDark, hasStatus]
  );

  return (
    <View style={styles.row}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <View
            style={[
              styles.dotWrap,
              {
                backgroundColor: `${accent}10`,
                borderColor: `${accent}18`,
              },
            ]}
          >
            <BotIcon size={12} color={accent} variant="stroke" />
          </View>

          <Text style={[styles.title, { color: titleText }]} numberOfLines={2}>
            {item.title}
          </Text>
        </View>

        {hasStatus && statusMeta ? (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusMeta.bg,
                borderColor: statusMeta.border,
              },
            ]}
          >
            <Text
              style={[styles.status, { color: statusMeta.text }]}
              numberOfLines={1}
            >
              {item.status}
            </Text>
          </View>
        ) : null}
      </View>

      {hasSubtitle ? (
        <View style={styles.metaRow}>
          <Tag01Icon size={11} color={softText} variant="stroke" />
          <Text style={[styles.subtitle, { color: mutedText }]} numberOfLines={3}>
            {item.subtitle}
          </Text>
        </View>
      ) : null}

      {dateStr ? (
        <View style={styles.metaRow}>
          <Calendar03Icon size={11} color={softText} variant="stroke" />
          <Text style={[styles.date, { color: mutedText }]} numberOfLines={1}>
            {dateStr}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dotWrap: {
    width: 20,
    height: 20,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    marginTop: 1,
  },
  title: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
    letterSpacing: -0.1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: 6,
    paddingLeft: 27,
  },
  subtitle: {
    flex: 1,
    fontSize: 9.5,
    fontWeight: "400",
    lineHeight: 13,
  },
  date: {
    fontSize: 9.5,
    fontWeight: "400",
    lineHeight: 12,
  },
  statusBadge: {
    maxWidth: "42%",
    minHeight: 22,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  status: {
    fontSize: 8.5,
    fontWeight: "500",
    lineHeight: 10,
  },
});