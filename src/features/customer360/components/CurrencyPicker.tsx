import React, { useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "hugeicons-react-native";

const ALL_VALUE = "ALL";

interface CurrencyPickerProps {
  selectedCurrency: string;
  currencyOptions: string[];
  label: string;
  allLabel: string;
  colors: Record<string, string>;
  onSelect: (value: string) => void;
}

export function CurrencyPicker({
  selectedCurrency,
  currencyOptions,
  label,
  allLabel,
  onSelect,
}: CurrencyPickerProps): React.ReactElement {
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";
  const [expanded, setExpanded] = useState(false);

  const titleText = isDark ? "#FFFFFF" : "#1F2937";
  const mutedText = isDark ? "rgba(255,255,255,0.56)" : "#6B7280";
  const softText = isDark ? "rgba(255,255,255,0.40)" : "#94A3B8";
  const accent = isDark ? "#EC4899" : "#DB2777";

  const chipBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.72)";
  const chipBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)";
  const activeBg = isDark ? "rgba(236,72,153,0.12)" : "rgba(219,39,119,0.10)";
  const activeBorder = isDark ? "rgba(236,72,153,0.22)" : "rgba(219,39,119,0.16)";

  const selectedLabel = useMemo(() => {
    if (selectedCurrency === ALL_VALUE) return allLabel;
    return selectedCurrency;
  }, [selectedCurrency, allLabel]);

  const visibleOptions = useMemo(() => {
    const base = [ALL_VALUE, ...currencyOptions.filter((x) => x !== ALL_VALUE)];
    return expanded ? base : [];
  }, [currencyOptions, expanded]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.triggerRow}
      >
        <Text style={[styles.label, { color: softText }]} numberOfLines={1}>
          {label}
        </Text>

        <View style={styles.triggerRight}>
          <Text style={[styles.selectedValue, { color: titleText }]} numberOfLines={1}>
            {selectedLabel}
          </Text>
          {expanded ? (
            <ArrowUp01Icon size={14} color={mutedText} variant="stroke" />
          ) : (
            <ArrowDown01Icon size={14} color={mutedText} variant="stroke" />
          )}
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.optionsRow}>
          {visibleOptions.map((value) => {
            const isSelected = selectedCurrency === value;
            const text = value === ALL_VALUE ? allLabel : value;

            return (
              <TouchableOpacity
                key={value}
                activeOpacity={0.82}
                onPress={() => {
                  onSelect(value);
                  setExpanded(false);
                }}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: isSelected ? activeBg : chipBg,
                    borderColor: isSelected ? activeBorder : chipBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isSelected ? accent : mutedText },
                  ]}
                  numberOfLines={1}
                >
                  {text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 1,
    paddingBottom: 1,
  },
  triggerRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  label: {
    flex: 1,
    fontSize: 9,
    fontWeight: "400",
    lineHeight: 11,
  },
  triggerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "62%",
  },
  selectedValue: {
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 12,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  optionChip: {
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 9,
    fontWeight: "500",
    lineHeight: 11,
  },
});

export { ALL_VALUE as CURRENCY_ALL };