import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../../components/ui/text";

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
  colors,
  onSelect,
}: CurrencyPickerProps): React.ReactElement {
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.optionsRow, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.option,
            selectedCurrency === ALL_VALUE && {
              backgroundColor: colors.accent,
            },
          ]}
          onPress={() => onSelect(ALL_VALUE)}
        >
          <Text
            style={[
              styles.optionText,
              {
                color:
                  selectedCurrency === ALL_VALUE ? "#FFFFFF" : colors.text,
              },
            ]}
          >
            {allLabel}
          </Text>
        </TouchableOpacity>
        {currencyOptions.map((code) => {
          const isSelected = selectedCurrency === code;
          return (
            <TouchableOpacity
              key={code}
              style={[styles.option, isSelected && { backgroundColor: colors.accent }]}
              onPress={() => onSelect(code)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? "#FFFFFF" : colors.text },
                ]}
              >
                {code}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export { ALL_VALUE as CURRENCY_ALL };
