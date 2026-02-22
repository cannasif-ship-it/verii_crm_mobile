import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { FormField, LocationPicker, CustomerPicker } from "../../customer";
import { useCountries, useCities, useDistricts } from "../../customer/hooks";
import { useShippingAddress, useCreateShippingAddress, useUpdateShippingAddress } from "../hooks";
import { createShippingAddressSchema, type ShippingAddressFormData } from "../schemas";
import type { CustomerDto, CountryDto, CityDto, DistrictDto } from "../../customer";

export function ShippingAddressFormScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const isEditMode = !!id;
  const addressId = id ? Number(id) : undefined;

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const [selectedCustomerName, setSelectedCustomerName] = useState<string | undefined>();

  const { data: existingAddress, isLoading: addressLoading } = useShippingAddress(addressId);
  const createAddress = useCreateShippingAddress();
  const updateAddress = useUpdateShippingAddress();

  const schema = useMemo(() => createShippingAddressSchema(), []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: "",
      postalCode: "",
      contactPerson: "",
      phone: "",
      notes: "",
      customerId: 0,
    },
  });

  const watchCountryId = watch("countryId");
  const watchCityId = watch("cityId");
  const watchDistrictId = watch("districtId");
  const watchCustomerId = watch("customerId");
  const { data: countries } = useCountries();
  const { data: cities } = useCities(watchCountryId);
  const { data: districts } = useDistricts(watchCityId);
  const [pendingCountryName, setPendingCountryName] = useState<string | null>(null);
  const [pendingCityName, setPendingCityName] = useState<string | null>(null);
  const [pendingDistrictName, setPendingDistrictName] = useState<string | null>(null);

  const normalizeLookupName = useCallback((value?: string | null): string => {
    if (!value) return "";
    return value
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9çğıöşü]+/g, "")
      .trim();
  }, []);

  const findLookupByName = useCallback(<T extends { id: number; name: string }>(
    items: T[] | undefined,
    name?: string | null
  ): T | undefined => {
    if (!items || items.length === 0 || !name) return undefined;
    const target = normalizeLookupName(name);
    if (!target) return undefined;
    return items.find((item) => {
      const normalized = normalizeLookupName(item.name);
      return normalized === target || normalized.includes(target) || target.includes(normalized);
    });
  }, [normalizeLookupName]);

  useEffect(() => {
    if (existingAddress) {
      reset({
        address: existingAddress.address,
        postalCode: existingAddress.postalCode || "",
        contactPerson: existingAddress.contactPerson || "",
        phone: existingAddress.phone || "",
        notes: existingAddress.notes || "",
        customerId: existingAddress.customerId,
        countryId: existingAddress.countryId,
        cityId: existingAddress.cityId,
        districtId: existingAddress.districtId,
      });
      setSelectedCustomerName(existingAddress.customerName);
    }
  }, [existingAddress, reset]);

  const handleCustomerChange = useCallback(
    (customer: CustomerDto | undefined) => {
      setValue("customerId", customer?.id || 0);
      setSelectedCustomerName(customer?.name);

      setValue("countryId", customer?.countryId);
      setValue("cityId", customer?.cityId);
      setValue("districtId", customer?.districtId);

      setPendingCountryName(customer?.countryName ?? null);
      setPendingCityName(customer?.cityName ?? null);
      setPendingDistrictName(customer?.districtName ?? null);
    },
    [setValue]
  );

  const handleCountryChange = useCallback(
    (country: CountryDto | undefined) => {
      setValue("countryId", country?.id);
      setValue("cityId", undefined);
      setValue("districtId", undefined);
      setPendingCountryName(null);
      setPendingCityName(null);
      setPendingDistrictName(null);
    },
    [setValue]
  );

  const handleCityChange = useCallback(
    (city: CityDto | undefined) => {
      setValue("cityId", city?.id);
      setValue("districtId", undefined);
      setPendingCityName(null);
      setPendingDistrictName(null);
    },
    [setValue]
  );

  const handleDistrictChange = useCallback(
    (district: DistrictDto | undefined) => {
      setValue("districtId", district?.id);
      setPendingDistrictName(null);
    },
    [setValue]
  );

  useEffect(() => {
    if (!pendingCountryName) return;
    if (watchCountryId) return;
    const matchedCountry = findLookupByName(countries, pendingCountryName);
    if (!matchedCountry) return;
    setValue("countryId", matchedCountry.id);
    setPendingCountryName(null);
  }, [pendingCountryName, watchCountryId, countries, findLookupByName, setValue]);

  useEffect(() => {
    if (!pendingCityName) return;
    if (!watchCountryId) return;
    if (watchCityId) return;
    const matchedCity = findLookupByName(cities, pendingCityName);
    if (!matchedCity) return;
    setValue("cityId", matchedCity.id);
    setPendingCityName(null);
  }, [pendingCityName, watchCountryId, watchCityId, cities, findLookupByName, setValue]);

  useEffect(() => {
    if (!pendingDistrictName) return;
    if (!watchCityId) return;
    if (watchDistrictId) return;
    const matchedDistrict = findLookupByName(districts, pendingDistrictName);
    if (!matchedDistrict) return;
    setValue("districtId", matchedDistrict.id);
    setPendingDistrictName(null);
  }, [pendingDistrictName, watchCityId, watchDistrictId, districts, findLookupByName, setValue]);

  const onSubmit = useCallback(
    async (data: ShippingAddressFormData) => {
      try {
        if (isEditMode && addressId) {
          await updateAddress.mutateAsync({ id: addressId, data });
          Alert.alert("", t("shippingAddress.updateSuccess"));
        } else {
          await createAddress.mutateAsync(data);
          Alert.alert("", t("shippingAddress.createSuccess"));
        }
        router.back();
      } catch {
        Alert.alert(t("common.error"), t("common.error"));
      }
    },
    [isEditMode, addressId, createAddress, updateAddress, router, t]
  );

  if (isEditMode && addressLoading) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("shippingAddress.edit")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={isEditMode ? t("shippingAddress.edit") : t("shippingAddress.create")}
          showBackButton
        />
        <FlatListScrollView
          style={[styles.content, { backgroundColor: contentBackground }]}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.fieldContainer}>
            <CustomerPicker
              value={watchCustomerId || undefined}
              customerName={selectedCustomerName}
              onChange={handleCustomerChange}
              label={t("shippingAddress.customer")}
            />
            {errors.customerId && (
              <Text style={[styles.error, { color: colors.error }]}>
                {errors.customerId.message}
              </Text>
            )}
          </View>

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("shippingAddress.address")}
                value={value}
                onChangeText={onChange}
                error={errors.address?.message}
                required
                multiline
                numberOfLines={3}
                maxLength={150}
              />
            )}
          />

          <View style={styles.locationSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("lookup.location")}</Text>
            <LocationPicker
              countryId={watchCountryId}
              cityId={watchCityId}
              districtId={watch("districtId")}
              onCountryChange={handleCountryChange}
              onCityChange={handleCityChange}
              onDistrictChange={handleDistrictChange}
            />
          </View>

          <Controller
            control={control}
            name="postalCode"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("shippingAddress.postalCode")}
                value={value || ""}
                onChangeText={onChange}
                maxLength={20}
              />
            )}
          />

          <Controller
            control={control}
            name="contactPerson"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("shippingAddress.contactPerson")}
                value={value || ""}
                onChangeText={onChange}
                maxLength={100}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("shippingAddress.phone")}
                value={value || ""}
                onChangeText={onChange}
                keyboardType="phone-pad"
                maxLength={20}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("shippingAddress.notes")}
                value={value || ""}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                maxLength={100}
              />
            )}
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.accent }]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? t("common.update") : t("common.save")}
              </Text>
            )}
          </TouchableOpacity>
        </FlatListScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  locationSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
