import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";

interface KpiCardProps {
  label: string;
  value: number | string;
  colors: Record<string, string>;
}

export function KpiCard({ label, value, colors }: KpiCardProps): React.ReactElement {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 100,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
});
