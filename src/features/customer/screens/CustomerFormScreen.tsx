import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useAuthStore } from "../../../store/auth";
import { useCustomer, useCreateCustomer, useUpdateCustomer, useCustomerTypes, useBusinessCardScan } from "../hooks";
import { FormField, LocationPicker } from "../components";
import { createCustomerSchema, type CustomerFormData } from "../schemas";
import type { CountryDto, CityDto, DistrictDto, CustomerTypeDto } from "../types";

export function CustomerFormScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, themeMode } = useUIStore();
  const { branch } = useAuthStore();
  const insets = useSafeAreaInsets();

  const isEditMode = !!id;
  const customerId = id ? Number(id) : undefined;

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const [customerTypeModalOpen, setCustomerTypeModalOpen] = useState(false);

  const { data: existingCustomer, isLoading: customerLoading } = useCustomer(customerId);
  const { data: customerTypes } = useCustomerTypes();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const { scanBusinessCard, isScanning, error: scanError } = useBusinessCardScan();

  const schema = useMemo(() => createCustomerSchema(), []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      customerCode: "",
      taxNumber: "",
      taxOffice: "",
      tcknNumber: "",
      address: "",
      phone: "",
      phone2: "",
      email: "",
      website: "",
      notes: "",
      salesRepCode: "",
      groupCode: "",
      branchCode: branch?.code ? Number(branch.code) : 1,
      businessUnitCode: 1,
    },
  });

  const watchCountryId = watch("countryId");
  const watchCityId = watch("cityId");
  const watchCustomerTypeId = watch("customerTypeId");

  const selectedCustomerType = customerTypes?.find((ct) => ct.id === watchCustomerTypeId);

  useEffect(() => {
    if (existingCustomer) {
      reset({
        name: existingCustomer.name,
        customerCode: existingCustomer.customerCode || "",
        taxNumber: existingCustomer.taxNumber || "",
        taxOffice: existingCustomer.taxOffice || "",
        tcknNumber: existingCustomer.tcknNumber || "",
        address: existingCustomer.address || "",
        phone: existingCustomer.phone || "",
        phone2: existingCustomer.phone2 || "",
        email: existingCustomer.email || "",
        website: existingCustomer.website || "",
        notes: existingCustomer.notes || "",
        countryId: existingCustomer.countryId,
        cityId: existingCustomer.cityId,
        districtId: existingCustomer.districtId,
        customerTypeId: existingCustomer.customerTypeId,
        salesRepCode: existingCustomer.salesRepCode || "",
        groupCode: existingCustomer.groupCode || "",
        creditLimit: existingCustomer.creditLimit,
        branchCode: existingCustomer.branchCode,
        businessUnitCode: existingCustomer.businessUnitCode,
      });
    }
  }, [existingCustomer, reset]);

  const handleCountryChange = useCallback(
    (country: CountryDto | undefined) => {
      setValue("countryId", country?.id);
    },
    [setValue]
  );

  const handleCityChange = useCallback(
    (city: CityDto | undefined) => {
      setValue("cityId", city?.id);
    },
    [setValue]
  );

  const handleDistrictChange = useCallback(
    (district: DistrictDto | undefined) => {
      setValue("districtId", district?.id);
    },
    [setValue]
  );

  const handleCustomerTypeSelect = useCallback(
    (type: CustomerTypeDto) => {
      setValue("customerTypeId", type.id);
      setCustomerTypeModalOpen(false);
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (data: CustomerFormData) => {
      try {
        const payload = {
          ...data,
          email: data.email || undefined,
        };

        if (isEditMode && customerId) {
          await updateCustomer.mutateAsync({ id: customerId, data: payload });
          Alert.alert("", t("customer.updateSuccess"));
        } else {
          await createCustomer.mutateAsync(payload);
          Alert.alert("", t("customer.createSuccess"));
        }
        router.back();
      } catch {
        Alert.alert(t("common.error"), t("common.error"));
      }
    },
    [isEditMode, customerId, createCustomer, updateCustomer, router, t]
  );

  useEffect(() => {
    if (scanError) {
      Alert.alert("Kartvizit Tarama", scanError);
    }
  }, [scanError]);

  const handleScanBusinessCard = useCallback(() => {
    scanBusinessCard((data) => {
      if (data.customerName) setValue("name", data.customerName);
      if (data.email) setValue("email", data.email ?? "");
      if (data.phone1) setValue("phone", data.phone1);
      if (data.address) setValue("address", data.address ?? "");
      if (data.website) setValue("website", data.website ?? "");
    });
  }, [scanBusinessCard, setValue]);

  const renderCustomerTypeItem = useCallback(
    ({ item }: { item: CustomerTypeDto }) => {
      const isSelected = watchCustomerTypeId === item.id;
      return (
        <TouchableOpacity
          style={[
            styles.pickerItem,
            { borderBottomColor: colors.border },
            isSelected && { backgroundColor: colors.activeBackground },
          ]}
          onPress={() => handleCustomerTypeSelect(item)}
        >
          <Text style={[styles.pickerItemText, { color: colors.text }]}>{item.name}</Text>
          {isSelected && <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>}
        </TouchableOpacity>
      );
    },
    [watchCustomerTypeId, colors, handleCustomerTypeSelect]
  );

  if (isEditMode && customerLoading) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("customer.edit")} showBackButton />
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
          title={isEditMode ? t("customer.edit") : t("customer.create")}
          showBackButton
        />
        <ScrollView
          style={[styles.content, { backgroundColor: contentBackground }]}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!isEditMode && (
            <View style={[styles.businessCardRow, { borderColor: colors.border }]}>
              <Text style={[styles.businessCardLabel, { color: colors.textSecondary }]}>
                Kartvizit tara
              </Text>
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                onPress={handleScanBusinessCard}
                disabled={isScanning}
              >
                {isScanning ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text style={styles.cameraIcon}>📷</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.name")}
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                required
                maxLength={250}
              />
            )}
          />

          <Controller
            control={control}
            name="customerCode"
            render={({ field: { value } }) => (
              <FormField
                label={t("customer.customerCode")}
                value={value || ""}
                onChangeText={() => {}}
                maxLength={100}
                editable={false}
              />
            )}
          />

          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("customer.customerType")}
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerField,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              ]}
              onPress={() => setCustomerTypeModalOpen(true)}
            >
              <Text
                style={[
                  styles.pickerFieldText,
                  { color: selectedCustomerType ? colors.text : colors.textMuted },
                ]}
              >
                {selectedCustomerType?.name || t("lookup.selectCustomerType")}
              </Text>
              <Text style={[styles.arrow, { color: colors.textMuted }]}>▼</Text>
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.phone")}
                value={value || ""}
                onChangeText={onChange}
                keyboardType="phone-pad"
                maxLength={100}
              />
            )}
          />

          <Controller
            control={control}
            name="phone2"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.phone2")}
                value={value || ""}
                onChangeText={onChange}
                keyboardType="phone-pad"
                maxLength={100}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.email")}
                value={value || ""}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
              />
            )}
          />

          <Controller
            control={control}
            name="website"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.website")}
                value={value || ""}
                onChangeText={onChange}
                autoCapitalize="none"
                maxLength={100}
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.address")}
                value={value || ""}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                maxLength={500}
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
            name="taxNumber"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.taxNumber")}
                value={value || ""}
                onChangeText={onChange}
                keyboardType="numeric"
                maxLength={15}
              />
            )}
          />

          <Controller
            control={control}
            name="taxOffice"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.taxOffice")}
                value={value || ""}
                onChangeText={onChange}
                maxLength={100}
              />
            )}
          />

          <Controller
            control={control}
            name="tcknNumber"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.tcknNumber")}
                value={value || ""}
                onChangeText={onChange}
                keyboardType="numeric"
                maxLength={20}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <FormField
                label={t("customer.notes")}
                value={value || ""}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                maxLength={250}
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
        </ScrollView>
      </View>

      <Modal
        visible={customerTypeModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomerTypeModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setCustomerTypeModalOpen(false)}
          />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("lookup.selectCustomerType")}
              </Text>
            </View>
            <FlatList
              data={customerTypes}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderCustomerTypeItem}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
  businessCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  businessCardLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  cameraButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIcon: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  pickerField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  pickerFieldText: {
    fontSize: 15,
    flex: 1,
  },
  arrow: {
    fontSize: 10,
    marginLeft: 8,
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
