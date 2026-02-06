import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import type { Customer360SimpleItemDto } from "../types";

interface SimpleItemRowProps {
  item: Customer360SimpleItemDto;
  colors: Record<string, string>;
  formatDate: (date: string | null | undefined) => string;
}

export function SimpleItemRow({
  item,
  colors,
  formatDate,
}: SimpleItemRowProps): React.ReactElement {
  const parts: string[] = [item.title];
  if (item.subtitle) parts.push(item.subtitle);
  const titleLine = parts.join(" · ");
  const dateStr = item.date ? formatDate(item.date) : null;

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {titleLine}
      </Text>
      {dateStr !== null && (
        <Text style={[styles.date, { color: colors.textMuted }]}>{dateStr}</Text>
      )}
      {item.status != null && item.status !== "" && (
        <Text style={[styles.status, { color: colors.textSecondary }]}>{item.status}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
});
