import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Text } from "../../../components/ui/text";
import type { Customer360DistributionDto } from "../types";

const CHART_COLORS = {
  demand: "#8B5CF6",
  quotation: "#EC4899",
  order: "#F97316",
};
const safeNumber = (value: unknown): number => {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const CHART_SIZE = Math.min(Dimensions.get("window").width - 80, 220);

interface DistributionPieChartProps {
  data: Customer360DistributionDto;
  colors: Record<string, string>;
  noDataKey: string;
  demandLabel: string;
  quotationLabel: string;
  orderLabel: string;
}

export function DistributionPieChart({
  data,
  colors,
  noDataKey,
  demandLabel,
  quotationLabel,
  orderLabel,
}: DistributionPieChartProps): React.ReactElement {
  const pieData = useMemo(() => {
    const items: { value: number; color: string; text: string }[] = [];
    const demandCount = safeNumber(data?.demandCount);
    const quotationCount = safeNumber(data?.quotationCount);
    const orderCount = safeNumber(data?.orderCount);

    if (demandCount > 0) {
      items.push({
        value: demandCount,
        color: CHART_COLORS.demand,
        text: demandLabel,
      });
    }
    if (quotationCount > 0) {
      items.push({
        value: quotationCount,
        color: CHART_COLORS.quotation,
        text: quotationLabel,
      });
    }
    if (orderCount > 0) {
      items.push({
        value: orderCount,
        color: CHART_COLORS.order,
        text: orderLabel,
      });
    }
    return items;
  }, [data, demandLabel, quotationLabel, orderLabel]);

  if (pieData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.noData, { color: colors.textMuted }]}>{noDataKey}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.chartRow}>
        <PieChart
          data={pieData}
          donut
          radius={CHART_SIZE / 2 - 24}
          innerRadius={(CHART_SIZE / 2 - 24) * 0.55}
          centerLabelComponent={() => null}
          showText
          textColor={colors.text}
          textSize={12}
          showValuesAsLabels
          focusOnPress={false}
        />
        <View style={styles.legend}>
          {pieData.map((p, i) => (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: p.color }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>
                {p.text}: {p.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
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
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  noData: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 24,
  },
  legend: {
    marginLeft: 20,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
});
