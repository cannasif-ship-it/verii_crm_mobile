import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Controller, Control } from "react-hook-form";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { PickerModal } from "./PickerModal";
import type { CreateDemandSchema } from "../schemas";
import { OfferType } from "../types";

interface OfferTypePickerProps {
  control: Control<CreateDemandSchema>;
  disabled?: boolean;
}

export function OfferTypePicker({
  control,
  disabled = false,
}: OfferTypePickerProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();

  const [modalVisible, setModalVisible] = React.useState(false);

  const offerTypeOptions = React.useMemo(
    () => [
      { id: OfferType.Domestic, name: t("demand.offerType.domestic", "Yurtiçi") },
      { id: OfferType.Export, name: t("demand.offerType.export", "Yurtdışı") },
    ],
    [t]
  );

  return (
    <Controller
      control={control}
      name="demand.offerType"
      rules={{ required: "Talep tipi seçilmelidir" }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <View style={styles.labelContainer}>
            <Text style={styles.labelIcon}>📋</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("demand.offerType.label", "Talep Tipi")}{" "}
              <Text style={[styles.required, { color: colors.accent }]}>*</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: error ? colors.error : colors.border,
              },
            ]}
            onPress={() => !disabled && setModalVisible(true)}
            disabled={disabled}
            activeOpacity={disabled ? 1 : undefined}
          >
            <Text
              style={[
                styles.pickerText,
                {
                  color: value ? colors.text : colors.textMuted,
                },
              ]}
              numberOfLines={1}
            >
              {value
                ? offerTypeOptions.find((opt) => opt.id === value)?.name || t("common.select", "Seçiniz")
                : t("common.select", "Seçiniz")}
            </Text>
            <Text style={[styles.arrowIcon, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>

          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error.message || t("demand.offerType.required", "Talep tipi seçilmelidir")}
            </Text>
          )}

          <PickerModal
            visible={modalVisible}
            options={offerTypeOptions}
            selectedValue={value || undefined}
            onSelect={(option) => {
              onChange(option.id);
              setModalVisible(false);
            }}
            onClose={() => setModalVisible(false)}
            title={t("demand.offerType.selectTitle", "Talep Tipi Seçiniz")}
            searchPlaceholder={t("demand.offerType.searchPlaceholder", "Talep tipi ara...")}
            isLoading={false}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  labelIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  required: {
    fontSize: 14,
    fontWeight: "600",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  pickerText: {
    fontSize: 15,
    flex: 1,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: "300",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
