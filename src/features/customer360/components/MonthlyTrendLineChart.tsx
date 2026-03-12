import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { AnalyticsUpIcon, Invoice03Icon, ShoppingBag03Icon } from "hugeicons-react-native";
import type { Customer360MonthlyTrendItemDto } from "../types";

const CHART_COLORS = {
  demand: "#8B5CF6",
  quotation: "#EC4899",
  order: "#F97316",
};

const CHART_WIDTH = Math.min(Dimensions.get("window").width - 112, 280);
const CHART_HEIGHT = 154;

const safeNumber = (value: unknown): number => {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

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
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const cardBg = isDark ? "rgba(18,8,25,0.62)" : "rgba(255,250,252,0.82)";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(219,39,119,0.07)";
  const chartBg = isDark ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.78)";
  const titleText = isDark ? "#F8FAFC" : "#1F2937";
  const mutedText = isDark ? "rgba(255,255,255,0.50)" : "#6B7280";
  const softText = isDark ? "rgba(255,255,255,0.38)" : "#94A3B8";
  const axisColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)";

  const normalizedData = data ?? [];

  const dataSet = useMemo(() => {
    if (normalizedData.length === 0) return null;

    const demandData = normalizedData.map((d) => ({
      value: safeNumber(d.demandCount),
      label: d.month,
      dataPointText: String(safeNumber(d.demandCount)),
    }));

    const quotationData = normalizedData.map((d) => ({
      value: safeNumber(d.quotationCount),
      label: d.month,
      dataPointText: String(safeNumber(d.quotationCount)),
    }));

    const orderData = normalizedData.map((d) => ({
      value: safeNumber(d.orderCount),
      label: d.month,
      dataPointText: String(safeNumber(d.orderCount)),
    }));

    return [
      { data: demandData, color: CHART_COLORS.demand },
      { data: quotationData, color: CHART_COLORS.quotation },
      { data: orderData, color: CHART_COLORS.order },
    ];
  }, [normalizedData]);

  const maxValue = useMemo(() => {
    if (!normalizedData.length) return 10;
    return Math.max(
      1,
      ...normalizedData.flatMap((d) => [
        safeNumber(d.demandCount),
        safeNumber(d.quotationCount),
        safeNumber(d.orderCount),
      ])
    );
  }, [normalizedData]);

  if (!normalizedData.length) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
        ]}
      >
        <View
          style={[
            styles.emptyWrap,
            {
              backgroundColor: chartBg,
              borderColor: cardBorder,
            },
          ]}
        >
          <Text style={[styles.noData, { color: mutedText }]}>{noDataKey}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
      ]}
    >
      <View
        style={[
          styles.chartShell,
          {
            backgroundColor: chartBg,
            borderColor: cardBorder,
          },
        ]}
      >
        <LineChart
          dataSet={dataSet!}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          maxValue={maxValue + Math.ceil(maxValue * 0.12)}
          noOfSections={4}
          spacing={Math.max(26, (CHART_WIDTH - 46) / Math.max(normalizedData.length, 1))}
          initialSpacing={8}
          endSpacing={8}
          xAxisColor={axisColor}
          yAxisColor={axisColor}
          color1={CHART_COLORS.demand}
          color2={CHART_COLORS.quotation}
          color3={CHART_COLORS.order}
          dataPointsColor1={CHART_COLORS.demand}
          dataPointsColor2={CHART_COLORS.quotation}
          dataPointsColor3={CHART_COLORS.order}
          textColor1={titleText}
          textColor2={titleText}
          textColor3={titleText}
          hideDataPoints={false}
          dataPointsRadius={3}
          thickness1={2}
          thickness2={2}
          thickness3={2}
          hideRules
          xAxisLabelTextStyle={{ color: softText, fontSize: 8 }}
          yAxisTextStyle={{ color: softText, fontSize: 8 }}
          showVerticalLines={false}
          curved
          isAnimated
          areaChart1
          areaChart2
          areaChart3
          startFillColor1="rgba(139,92,246,0.08)"
          endFillColor1="rgba(139,92,246,0.01)"
          startFillColor2="rgba(236,72,153,0.08)"
          endFillColor2="rgba(236,72,153,0.01)"
          startFillColor3="rgba(249,115,22,0.08)"
          endFillColor3="rgba(249,115,22,0.01)"
          startOpacity={0.7}
          endOpacity={0.04}
        />
      </View>

      <View style={styles.legend}>
        <View
          style={[
            styles.legendChip,
            {
              backgroundColor: isDark ? "rgba(139,92,246,0.10)" : "rgba(139,92,246,0.08)",
              borderColor: isDark ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.14)",
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: "rgba(139,92,246,0.14)" }]}>
            <AnalyticsUpIcon size={11} color={CHART_COLORS.demand} variant="stroke" />
          </View>
          <Text style={[styles.legendText, { color: titleText }]} numberOfLines={1}>
            {demandLabel}
          </Text>
        </View>

        <View
          style={[
            styles.legendChip,
            {
              backgroundColor: isDark ? "rgba(236,72,153,0.10)" : "rgba(236,72,153,0.08)",
              borderColor: isDark ? "rgba(236,72,153,0.18)" : "rgba(236,72,153,0.14)",
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: "rgba(236,72,153,0.14)" }]}>
            <Invoice03Icon size={11} color={CHART_COLORS.quotation} variant="stroke" />
          </View>
          <Text style={[styles.legendText, { color: titleText }]} numberOfLines={1}>
            {quotationLabel}
          </Text>
        </View>

        <View
          style={[
            styles.legendChip,
            {
              backgroundColor: isDark ? "rgba(249,115,22,0.10)" : "rgba(249,115,22,0.08)",
              borderColor: isDark ? "rgba(249,115,22,0.18)" : "rgba(249,115,22,0.14)",
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: "rgba(249,115,22,0.14)" }]}>
            <ShoppingBag03Icon size={11} color={CHART_COLORS.order} variant="stroke" />
          </View>
          <Text style={[styles.legendText, { color: titleText }]} numberOfLines={1}>
            {orderLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 2,
  },
  chartShell: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 8,
    overflow: "hidden",
  },
  emptyWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  noData: {
    fontSize: 10,
    textAlign: "center",
    paddingVertical: 18,
    fontWeight: "400",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  legendChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxWidth: "48%",
  },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  legendText: {
    fontSize: 9,
    fontWeight: "500",
    lineHeight: 12,
    flexShrink: 1,
  },
});