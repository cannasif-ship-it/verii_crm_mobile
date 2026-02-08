import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Text } from "../../../components/ui/text";
import type { Customer360AmountComparisonDto } from "../types";

const CHART_COLORS = {
  last12: "#8B5CF6",
  openQuotation: "#EC4899",
  openOrder: "#F97316",
};

const CHART_WIDTH = Math.min(Dimensions.get("window").width - 72, 320);
const BAR_HEIGHT = 28;
const safeNumber = (value: unknown): number => {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

interface AmountComparisonBarChartProps {
  data: Customer360AmountComparisonDto;
  colors: Record<string, string>;
  noDataKey: string;
  last12Label: string;
  openQuotationLabel: string;
  openOrderLabel: string;
  formatAmount: (value: number) => string;
}

export function AmountComparisonBarChart({
  data,
  colors,
  noDataKey,
  last12Label,
  openQuotationLabel,
  openOrderLabel,
  formatAmount,
}: AmountComparisonBarChartProps): React.ReactElement {
  const barData = useMemo(() => {
    const last12 = safeNumber(data?.last12MonthsOrderAmount);
    const openQuot = safeNumber(data?.openQuotationAmount);
    const openOrd = safeNumber(data?.openOrderAmount);
    return [
      {
        value: last12,
        label: last12Label,
        frontColor: CHART_COLORS.last12,
        topLabelComponent: () => (
          <Text style={[styles.barValue, { color: colors.text }]}>
            {formatAmount(last12)}
          </Text>
        ),
      },
      {
        value: openQuot,
        label: openQuotationLabel,
        frontColor: CHART_COLORS.openQuotation,
        topLabelComponent: () => (
          <Text style={[styles.barValue, { color: colors.text }]}>
            {formatAmount(openQuot)}
          </Text>
        ),
      },
      {
        value: openOrd,
        label: openOrderLabel,
        frontColor: CHART_COLORS.openOrder,
        topLabelComponent: () => (
          <Text style={[styles.barValue, { color: colors.text }]}>
            {formatAmount(openOrd)}
          </Text>
        ),
      },
    ];
  }, [
    data,
    last12Label,
    openQuotationLabel,
    openOrderLabel,
    formatAmount,
    colors.text,
  ]);

  const maxValue = useMemo(() => {
    const last12 = safeNumber(data?.last12MonthsOrderAmount);
    const openQuot = safeNumber(data?.openQuotationAmount);
    const openOrd = safeNumber(data?.openOrderAmount);
    const max = Math.max(last12, openQuot, openOrd, 1);
    return max + Math.ceil(max * 0.15);
  }, [data]);

  const totalZero = barData.every((b) => b.value === 0);
  if (totalZero) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.noData, { color: colors.textMuted }]}>{noDataKey}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <BarChart
        data={barData}
        horizontal
        width={CHART_WIDTH}
        barWidth={BAR_HEIGHT}
        maxValue={maxValue}
        spacing={44}
        initialSpacing={20}
        endSpacing={20}
        xAxisThickness={0}
        yAxisThickness={0}
        hideRules
        noOfSections={4}
        barBorderRadius={6}
        isAnimated
        xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 11 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  noData: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 24,
  },
  barValue: {
    fontSize: 11,
    fontWeight: "600",
  },
});
