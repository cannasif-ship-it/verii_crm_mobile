import React, { useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text } from "../../../components/ui/text";
import type { Customer360SimpleItemDto } from "../types";
import { SimpleItemRow } from "./SimpleItemRow";

interface SectionCardProps {
  title: string;
  items: Customer360SimpleItemDto[];
  colors: Record<string, string>;
  noDataKey: string;
  formatDate: (date: string | null | undefined) => string;
}

export function SectionCard({
  title,
  items,
  colors,
  noDataKey,
  formatDate,
}: SectionCardProps): React.ReactElement {
  const list = items ?? [];
  const isEmpty = list.length === 0;

  const renderItem = useCallback(
    ({ item }: { item: Customer360SimpleItemDto }) => (
      <SimpleItemRow item={item} colors={colors} formatDate={formatDate} />
    ),
    [colors, formatDate]
  );

  const keyExtractor = useCallback((item: Customer360SimpleItemDto) => String(item.id), []);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {isEmpty ? (
        <Text style={[styles.noData, { color: colors.textMuted }]}>{noDataKey}</Text>
      ) : (
        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
        />
      )}
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
