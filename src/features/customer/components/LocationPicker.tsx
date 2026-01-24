import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useCountries, useCities, useDistricts } from "../hooks";
import type { CountryDto, CityDto, DistrictDto } from "../types";

interface LocationPickerProps {
  countryId?: number;
  cityId?: number;
  districtId?: number;
  onCountryChange: (country: CountryDto | undefined) => void;
  onCityChange: (city: CityDto | undefined) => void;
  onDistrictChange: (district: DistrictDto | undefined) => void;
  disabled?: boolean;
}

type PickerType = "country" | "city" | "district";

interface PickerItem {
  id: number;
  name: string;
}

export function LocationPicker({
  countryId,
  cityId,
  districtId,
  onCountryChange,
  onCityChange,
  onDistrictChange,
  disabled = false,
}: LocationPickerProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();

  const [activePickerType, setActivePickerType] = useState<PickerType | null>(null);

  const { data: countries, isLoading: countriesLoading } = useCountries();
  const { data: cities, isLoading: citiesLoading } = useCities(countryId);
  const { data: districts, isLoading: districtsLoading } = useDistricts(cityId);

  const selectedCountry = countries?.find((c) => c.id === countryId);
  const selectedCity = cities?.find((c) => c.id === cityId);
  const selectedDistrict = districts?.find((d) => d.id === districtId);

  useEffect(() => {
    if (countryId && cityId && cities) {
      const cityExists = cities.some((c) => c.id === cityId);
      if (!cityExists) {
        onCityChange(undefined);
        onDistrictChange(undefined);
      }
    }
  }, [countryId, cityId, cities, onCityChange, onDistrictChange]);

  useEffect(() => {
    if (cityId && districtId && districts) {
      const districtExists = districts.some((d) => d.id === districtId);
      if (!districtExists) {
        onDistrictChange(undefined);
      }
    }
  }, [cityId, districtId, districts, onDistrictChange]);

  const handlePickerOpen = useCallback((type: PickerType) => {
    setActivePickerType(type);
  }, []);

  const handlePickerClose = useCallback(() => {
    setActivePickerType(null);
  }, []);

  const handleSelect = useCallback(
    (item: PickerItem) => {
      if (activePickerType === "country") {
        const country = countries?.find((c) => c.id === item.id);
        onCountryChange(country);
        onCityChange(undefined);
        onDistrictChange(undefined);
      } else if (activePickerType === "city") {
        const city = cities?.find((c) => c.id === item.id);
        onCityChange(city);
        onDistrictChange(undefined);
      } else if (activePickerType === "district") {
        const district = districts?.find((d) => d.id === item.id);
        onDistrictChange(district);
      }
      handlePickerClose();
    },
    [
      activePickerType,
      countries,
      cities,
      districts,
      onCountryChange,
      onCityChange,
      onDistrictChange,
      handlePickerClose,
    ]
  );

  const getPickerData = useCallback((): PickerItem[] => {
    if (activePickerType === "country") {
      return countries?.map((c) => ({ id: c.id, name: c.name })) || [];
    }
    if (activePickerType === "city") {
      return cities?.map((c) => ({ id: c.id, name: c.name })) || [];
    }
    if (activePickerType === "district") {
      return districts?.map((d) => ({ id: d.id, name: d.name })) || [];
    }
    return [];
  }, [activePickerType, countries, cities, districts]);

  const getPickerTitle = useCallback((): string => {
    if (activePickerType === "country") {
      return t("lookup.selectCountry");
    }
    if (activePickerType === "city") {
      return t("lookup.selectCity");
    }
    if (activePickerType === "district") {
      return t("lookup.selectDistrict");
    }
    return "";
  }, [activePickerType, t]);

  const isPickerLoading =
    (activePickerType === "country" && countriesLoading) ||
    (activePickerType === "city" && citiesLoading) ||
    (activePickerType === "district" && districtsLoading);

  const renderPickerItem = useCallback(
    ({ item }: { item: PickerItem }) => {
      const isSelected =
        (activePickerType === "country" && countryId === item.id) ||
        (activePickerType === "city" && cityId === item.id) ||
        (activePickerType === "district" && districtId === item.id);

      return (
        <TouchableOpacity
          style={[
            styles.pickerItem,
            { borderBottomColor: colors.border },
            isSelected && { backgroundColor: colors.activeBackground },
          ]}
          onPress={() => handleSelect(item)}
        >
          <Text style={[styles.pickerItemText, { color: colors.text }]}>{item.name}</Text>
          {isSelected && <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>}
        </TouchableOpacity>
      );
    },
    [activePickerType, countryId, cityId, districtId, colors, handleSelect]
  );

  const renderField = (
    label: string,
    value: string | undefined,
    placeholder: string,
    type: PickerType,
    isDisabled: boolean
  ): React.ReactElement => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.field,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          isDisabled && styles.fieldDisabled,
        ]}
        onPress={() => !isDisabled && handlePickerOpen(type)}
        disabled={isDisabled || disabled}
      >
        <Text
          style={[
            styles.fieldText,
            { color: value ? colors.text : colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Text style={[styles.arrow, { color: colors.textMuted }]}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderField(
        t("lookup.country"),
        selectedCountry?.name,
        t("lookup.selectCountry"),
        "country",
        false
      )}
      {renderField(
        t("lookup.city"),
        selectedCity?.name,
        t("lookup.selectCity"),
        "city",
        !countryId
      )}
      {renderField(
        t("lookup.district"),
        selectedDistrict?.name,
        t("lookup.selectDistrict"),
        "district",
        !cityId
      )}

      <Modal
        visible={activePickerType !== null}
        transparent
        animationType="slide"
        onRequestClose={handlePickerClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={handlePickerClose} />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>{getPickerTitle()}</Text>
            </View>
            {isPickerLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : (
              <FlatList
                data={getPickerData()}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderPickerItem}
                style={styles.list}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  fieldContainer: {},
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  fieldDisabled: {
    opacity: 0.5,
  },
  fieldText: {
    fontSize: 15,
    flex: 1,
  },
  arrow: {
    fontSize: 10,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  list: {
    flexGrow: 0,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 16,
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "600",
  },
});
