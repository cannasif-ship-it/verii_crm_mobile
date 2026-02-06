import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text } from "../../../components/ui/text";
import type { Customer360MonthlyTrendItemDto } from "../types";

const CHART_COLORS = {
  demand: "#8B5CF6",
  quotation: "#EC4899",
  order: "#F97316",
};

const CHART_WIDTH = Math.min(Dimensions.get("window").width - 72, 320);
const CHART_HEIGHT = 180;

interface MonthlyTrendLineChartProps {
  data: Customer360MonthlyTrendItemDto[];
  colors: Record<string, string>;
  noDataKey: string;
  demandLabel: string;
  quotationLabel: string;
  orderLabel: string;
}

export function MonthlyTrendLineChart({
  data,
  colors,
  noDataKey,
  demandLabel,
  quotationLabel,
  orderLabel,
}: MonthlyTrendLineChartProps): React.ReactElement {
  const dataSet = useMemo(() => {
    const list = data ?? [];
    if (list.length === 0) return null;
    const demandData = list.map((d, i) => ({
      value: d.demandCount,
      label: d.month,
      dataPointText: String(d.demandCount),
    }));
    const quotationData = list.map((d, i) => ({
      value: d.quotationCount,
      label: d.month,
      dataPointText: String(d.quotationCount),
    }));
    const orderData = list.map((d, i) => ({
      value: d.orderCount,
      label: d.month,
      dataPointText: String(d.orderCount),
    }));
    return [
      { data: demandData, color: CHART_COLORS.demand },
      { data: quotationData, color: CHART_COLORS.quotation },
      { data: orderData, color: CHART_COLORS.order },
    ];
  }, [data]);

  const maxValue = useMemo(() => {
    if (!data?.length) return 10;
    return Math.max(
      1,
      ...data.flatMap((d) => [d.demandCount, d.quotationCount, d.orderCount])
    );
  }, [data]);

  if (!data?.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.noData, { color: colors.textMuted }]}>{noDataKey}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <LineChart
        dataSet={dataSet!}
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        maxValue={maxValue + Math.ceil(maxValue * 0.1)}
        noOfSections={4}
        spacing={Math.max(40, (CHART_WIDTH - 60) / (data.length || 1))}
        initialSpacing={20}
        endSpacing={20}
        xAxisColor={colors.border}
        yAxisColor={colors.border}
        color1={CHART_COLORS.demand}
        color2={CHART_COLORS.quotation}
        color3={CHART_COLORS.order}
        dataPointsColor1={CHART_COLORS.demand}
        dataPointsColor2={CHART_COLORS.quotation}
        dataPointsColor3={CHART_COLORS.order}
        textColor1={colors.text}
        textColor2={colors.text}
        textColor3={colors.text}
        hideDataPoints={false}
        hideRules
        xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        showVerticalLines={false}
        curved
        isAnimated
      />
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.demand }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>{demandLabel}</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.quotation }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>{quotationLabel}</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.order }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>{orderLabel}</Text>
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
  noData: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 24,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
});
