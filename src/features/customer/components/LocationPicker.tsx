import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useCountries, useCities, useDistricts } from "../hooks";
import type { CountryDto, CityDto, DistrictDto } from "../types";
import { ArrowDown01Icon, CheckmarkCircle02Icon } from "hugeicons-react-native";

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
  const { themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const isDark = themeMode === "dark";

  const THEME = {
    inputBg: isDark ? "rgba(0,0,0,0.3)" : "#F8FAFC",
    inputBorder: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)",
    modalBg: isDark ? "#0f172a" : "#FFFFFF",
    modalBorder: isDark ? "rgba(255,255,255,0.08)" : "transparent",
    text: isDark ? "#F8FAFC" : "#0F172A",
    textMute: isDark ? "#94a3b8" : "#64748B",
    primary: "#db2777", 
    itemBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    selectedBg: isDark ? 'rgba(219, 39, 119, 0.15)' : '#FFF0F5', 
    overlay: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
    shadow: isDark ? "#000000" : "#64748b",
  };

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

  const handlePickerOpen = useCallback((type: PickerType) => setActivePickerType(type), []);
  const handlePickerClose = useCallback(() => setActivePickerType(null), []);

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
    [activePickerType, countries, cities, districts, onCountryChange, onCityChange, onDistrictChange, handlePickerClose]
  );

  const getPickerData = useCallback((): PickerItem[] => {
    if (activePickerType === "country") return countries?.map((c) => ({ id: c.id, name: c.name })) || [];
    if (activePickerType === "city") return cities?.map((c) => ({ id: c.id, name: c.name })) || [];
    if (activePickerType === "district") return districts?.map((d) => ({ id: d.id, name: d.name })) || [];
    return [];
  }, [activePickerType, countries, cities, districts]);

  const getPickerTitle = useCallback((): string => {
    if (activePickerType === "country") return t("lookup.selectCountry");
    if (activePickerType === "city") return t("lookup.selectCity");
    if (activePickerType === "district") return t("lookup.selectDistrict");
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
          activeOpacity={0.7}
          style={[
            styles.optionItem,
            { 
                borderBottomColor: THEME.itemBorder,
                backgroundColor: isSelected ? THEME.selectedBg : 'transparent'
            }
          ]}
          onPress={() => handleSelect(item)}
        >
          <Text 
            style={[
                styles.optionText, 
                { 
                    color: isSelected ? THEME.primary : THEME.text,
                    fontWeight: isSelected ? "700" : "500"
                }
            ]}
           >
            {item.name}
          </Text>
          {isSelected && <CheckmarkCircle02Icon size={18} color={THEME.primary} variant="stroke" strokeWidth={2} />}
        </TouchableOpacity>
      );
    },
    [activePickerType, countryId, cityId, districtId, THEME, handleSelect]
  );

  const renderField = (label: string, value: string | undefined, placeholder: string, type: PickerType, isDisabled: boolean) => {
    const isActuallyDisabled = isDisabled || disabled;
    
    return (
        <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: THEME.textMute }]}>{label}</Text>
            <TouchableOpacity
                activeOpacity={0.7}
                style={[
                    styles.trigger,
                    { 
                        backgroundColor: THEME.inputBg, 
                        borderColor: THEME.inputBorder,
                        opacity: isActuallyDisabled ? 0.5 : 1
                    },
                ]}
                onPress={() => !isActuallyDisabled && handlePickerOpen(type)}
                disabled={isActuallyDisabled}
            >
                <Text
                    style={[
                        styles.triggerText,
                        { color: value ? THEME.text : THEME.textMute },
                    ]}
                    numberOfLines={1}
                >
                    {value || placeholder}
                </Text>
                <ArrowDown01Icon size={14} color={THEME.textMute} variant="stroke" strokeWidth={1.5} />
            </TouchableOpacity>
        </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderField("Ülke", selectedCountry?.name, "Seç", "country", false)}
      {renderField("Şehir", selectedCity?.name, "Seç", "city", !countryId)}
      {renderField("İlçe", selectedDistrict?.name, "Seç", "district", !cityId)}

      <Modal
        visible={activePickerType !== null}
        transparent
        animationType="slide"
        onRequestClose={handlePickerClose}
        statusBarTranslucent
      >
        <View style={[styles.modalOverlay, { backgroundColor: THEME.overlay }]}>
          <TouchableOpacity style={styles.backdrop} onPress={handlePickerClose} activeOpacity={1} />
          
          <View
            style={[
              styles.modalContent,
              { 
                  backgroundColor: THEME.modalBg, 
                  paddingBottom: insets.bottom + 10,
                  borderColor: THEME.modalBorder,
                  shadowColor: THEME.shadow
              },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: THEME.itemBorder }]}>
              <View style={[styles.handle, { backgroundColor: THEME.textMute }]} />
              <Text style={[styles.modalTitle, { color: THEME.text }]}>{getPickerTitle()}</Text>
            </View>

            {isPickerLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.primary} />
              </View>
            ) : (
              <FlatList
                data={getPickerData()}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderPickerItem}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: THEME.textMute }}>{t("common.noData")}</Text>
                    </View>
                }
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
    flexDirection: 'row',
    gap: 8,
  },
  fieldWrapper: {
    flex: 1,
    marginBottom: 0
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 2
  },
  trigger: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    marginRight: 6,
    marginTop: Platform.OS === 'android' ? 2 : 0 
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get("window").height * 0.70,
    minHeight: 250,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
    opacity: 0.25,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 20
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 14,
    letterSpacing: -0.2
  },
  emptyContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center'
  }
});