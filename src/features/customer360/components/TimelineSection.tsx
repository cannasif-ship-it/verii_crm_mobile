import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text } from "../../../components/ui/text";
import type { Customer360TimelineItemDto } from "../types";
import { TimelineRow } from "./TimelineRow";

interface TimelineSectionProps {
  title: string;
  timeline: Customer360TimelineItemDto[];
  colors: Record<string, string>;
  noDataKey: string;
  formatDateTime: (date: string) => string;
  getStatusLabel: (status: string | null | undefined) => string;
  formatAmount?: (value: number) => string;
}

export function TimelineSection({
  title,
  timeline,
  colors,
  noDataKey,
  formatDateTime,
  getStatusLabel,
  formatAmount,
}: TimelineSectionProps): React.ReactElement {
  const sorted = useMemo(() => {
    const list = timeline ?? [];
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timeline]);

  const renderItem = useCallback(
    ({ item }: { item: Customer360TimelineItemDto }) => (
      <TimelineRow
        item={item}
        colors={colors}
        formatDateTime={formatDateTime}
        statusLabel={getStatusLabel(item.status)}
        formatAmount={formatAmount}
      />
    ),
    [colors, formatDateTime, getStatusLabel, formatAmount]
  );

  const keyExtractor = useCallback((item: Customer360TimelineItemDto) => String(item.itemId), []);

  if (sorted.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.noData, { color: colors.textMuted }]}>{noDataKey}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <FlatList
        data={sorted}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  noData: {
    fontSize: 14,
  },
});
