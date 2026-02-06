import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import type { Salesmen360CurrencyAmountDto } from "../types";

interface CurrencyTotalsTableProps {
  items: Salesmen360CurrencyAmountDto[];
  colors: Record<string, string>;
  formatAmount: (value: number) => string;
  title: string;
  currencyLabel: string;
  demandAmountLabel: string;
  quotationAmountLabel: string;
  orderAmountLabel: string;
  noDataKey: string;
}

export function CurrencyTotalsTable({
  items,
  colors,
  formatAmount,
  title,
  currencyLabel,
  demandAmountLabel,
  quotationAmountLabel,
  orderAmountLabel,
  noDataKey,
}: CurrencyTotalsTableProps): React.ReactElement {
  const list = items ?? [];
  if (list.length === 0) {
    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.noData, { color: colors.textMuted }]}>{noDataKey}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.table, { borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.cellCurrency, { color: colors.textMuted }]}>
            {currencyLabel}
          </Text>
          <Text style={[styles.headerCell, { color: colors.textMuted }]}>{demandAmountLabel}</Text>
          <Text style={[styles.headerCell, { color: colors.textMuted }]}>{quotationAmountLabel}</Text>
          <Text style={[styles.headerCell, { color: colors.textMuted }]}>{orderAmountLabel}</Text>
        </View>
        {list.map((row, index) => (
          <View
            key={`${row.currency}-${index}`}
            style={[styles.dataRow, index < list.length - 1 && { borderBottomWidth: 1, borderColor: colors.border }]}
          >
            <Text style={[styles.cell, styles.cellCurrency, { color: colors.text }]}>{row.currency}</Text>
            <Text style={[styles.cell, { color: colors.text }]}>{formatAmount(row.demandAmount)}</Text>
            <Text style={[styles.cell, { color: colors.text }]}>{formatAmount(row.quotationAmount)}</Text>
            <Text style={[styles.cell, { color: colors.text }]}>{formatAmount(row.orderAmount)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
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
    textAlign: "center",
    paddingVertical: 12,
  },
  table: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  dataRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cell: {
    fontSize: 13,
    flex: 1,
  },
  cellCurrency: {
    flex: 0.8,
  },
});
