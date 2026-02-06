import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import type { Customer360TimelineItemDto } from "../types";

interface TimelineRowProps {
  item: Customer360TimelineItemDto;
  colors: Record<string, string>;
  formatDateTime: (date: string) => string;
  statusLabel: string;
  formatAmount?: (value: number) => string;
}

export function TimelineRow({
  item,
  colors,
  formatDateTime,
  statusLabel,
  formatAmount,
}: TimelineRowProps): React.ReactElement {
  const amountStr =
    item.amount != null && formatAmount
      ? formatAmount(item.amount)
      : item.amount != null
        ? String(item.amount)
        : null;
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.dateTime, { color: colors.textMuted }]}>
        {formatDateTime(item.date)}
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      {statusLabel !== "" && (
        <Text style={[styles.status, { color: colors.textSecondary }]}>{statusLabel}</Text>
      )}
      {amountStr !== null && (
        <Text style={[styles.amount, { color: colors.text }]}>{amountStr}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateTime: {
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 12,
    marginTop: 2,
  },
});
