import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useAuthStore } from "../../../store/auth";
import { useCustomer, useCreateCustomer, useUpdateCustomer, useCustomerTypes, useBusinessCardScan } from "../hooks";
import { useCustomerShippingAddresses } from "../../shipping-address/hooks/useShippingAddresses";
// BURASI GÜNCELLENDİ: PremiumPicker eklendi
import { FormField, LocationPicker, PremiumPicker } from "../components";
import { createCustomerSchema, type CustomerFormData } from "../schemas";
import type { CountryDto, CityDto, DistrictDto } from "../types";
import { 
  Camera01Icon, 
  ArrowDown01Icon, 
  CheckmarkCircle02Icon, 
  UserCircleIcon,
  ContactBookIcon,
  Location01Icon,
  Invoice01Icon,
  NoteIcon,
  Briefcase01Icon
} from "hugeicons-react-native";

export function CustomerFormScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors, themeMode } = useUIStore();
  const { branch, user } = useAuthStore();
  const insets = useSafeAreaInsets();

  const isEditMode = !!id;
  const customerId = id ? Number(id) : undefined;
  const isDark = themeMode === "dark";

  const mainBg = isDark ? "#0c0516" : "#F8FAFC"; 
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.15)', 'transparent', 'rgba(249, 115, 22, 0.15)'] 
    : ['rgba(255, 235, 240, 0.8)', '#FFFFFF', 'rgba(255, 240, 225, 0.8)']) as [string, string, ...string[]];

  const formConfig = {
    showCustomerCode: false,
    showBusinessCardScan: true,
    showCustomerType: true,
    showShippingAddress: false,
    showSalesRep: true,
    showGroupCode: true,
    showCreditLimit: false,
    showBranchCode: false,
    showBusinessUnit: false,
    showPhone: true,
    showPhone2: true,
    showEmail: true,
    showWebsite: true,
    showAddress: true,
    showLocation: true,
    showTaxNumber: false,
    showTaxOffice: false,
    showTCKN: false,
    showNotes: true,
  };

  const THEME = {
    bg: isDark ? "#020617" : "#F8FAFC",
    cardBg: isDark ? "rgba(15, 23, 42, 0.80)" : "#FFFFFF", 
    text: isDark ? "#F8FAFC" : "#0F172A",
    textMute: isDark ? "#94a3b8" : "#64748B",
    border: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)",
    primary: "#db2777",
    icon: isDark ? "#cbd5e1" : "#475569",
    inputBg: isDark ? "rgba(0,0,0,0.3)" : "#F8FAFC",
    shadow: isDark ? "#000000" : "#64748b",
  };

  // customerTypeModalOpen STATE'İ KALDIRILDI
  const [shippingAddressModalOpen, setShippingAddressModalOpen] = useState(false);

  const { data: existingCustomer, isLoading: customerLoading } = useCustomer(customerId);
  const { data: customerTypes } = useCustomerTypes();
  const { data: customerShippingAddresses = [] } = useCustomerShippingAddresses(customerId);
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
      salesRepCode: isEditMode ? "" : (user?.name ||""),
      groupCode: "",
      creditLimit: 0,
      defaultShippingAddressId: null,
      branchCode: branch?.code ? Number(branch.code) : 1,
      businessUnitCode: 1,
    },
  });

  const watchCountryId = watch("countryId");
  const watchCityId = watch("cityId");
  const watchCustomerTypeId = watch("customerTypeId");
  const watchDefaultShippingAddressId = watch("defaultShippingAddressId");

  // selectedCustomerType'a artık gerek kalmayabilir ama validation için tutulabilir, 
  // ancak UI için artık PremiumPicker handle edecek.
  const selectedShippingAddress = customerShippingAddresses.find((address) => address.id === watchDefaultShippingAddressId);

  // Customer Types verisini PremiumPicker formatına çevirelim
  const customerTypeOptions = useMemo(() => {
    if (!customerTypes) return [];
    return customerTypes.map(ct => ({
        label: ct.name,
        value: ct.id
    }));
  }, [customerTypes]);

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
        defaultShippingAddressId: existingCustomer.defaultShippingAddressId ?? null,
        branchCode: existingCustomer.branchCode,
        businessUnitCode: existingCustomer.businessUnitCode,
      });
    }
  }, [existingCustomer, reset]);

  const handleCountryChange = useCallback((country: CountryDto | undefined) => {
    setValue("countryId", country?.id);
    setValue("cityId", undefined);
    setValue("districtId", undefined);
  }, [setValue]);

  const handleCityChange = useCallback((city: CityDto | undefined) => {
    setValue("cityId", city?.id);
    setValue("districtId", undefined);
  }, [setValue]);

  const handleDistrictChange = useCallback((district: DistrictDto | undefined) => {
    setValue("districtId", district?.id);
  }, [setValue]);

  // handleCustomerTypeSelect KALDIRILDI (PremiumPicker kendi içinde halledecek)

  const handleShippingAddressSelect = useCallback((shippingAddressId: number) => {
    setValue("defaultShippingAddressId", shippingAddressId);
    setShippingAddressModalOpen(false);
  }, [setValue]);

  const toNumber = useCallback((v: number | undefined): number => {
    if (v === undefined || v === null) return 0;
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }, []);

  const toNumberOptional = useCallback((v: number | undefined): number | undefined => {
    if (v === undefined || v === null) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }, []);

  const onSubmit = useCallback(async (data: CustomerFormData) => {
    try {
      const base = {
        name: data.name,
        customerCode: data.customerCode || undefined,
        customerTypeId: data.customerTypeId,
        defaultShippingAddressId: data.defaultShippingAddressId ?? undefined,
        salesRepCode: data.salesRepCode || undefined,
        groupCode: data.groupCode || undefined,
        creditLimit: toNumberOptional(data.creditLimit),
        branchCode: toNumber(data.branchCode) || 1,
        businessUnitCode: toNumber(data.businessUnitCode) || 1,
        phone: data.phone || undefined,
        phone2: data.phone2 || undefined,
        email: data.email?.trim() ? data.email : undefined,
        website: data.website || undefined,
        address: data.address || undefined,
        taxNumber: data.taxNumber || undefined,
        taxOffice: data.taxOffice || undefined,
        tcknNumber: data.tcknNumber || undefined,
        notes: data.notes || undefined,
        countryId: data.countryId,
        cityId: data.cityId,
        districtId: data.districtId,
      };
      if (isEditMode && customerId) {
        const updatePayload = { ...base, completedDate: existingCustomer?.completionDate };
        await updateCustomer.mutateAsync({ id: customerId, data: updatePayload });
        Alert.alert("", t("customer.updateSuccess"));
      } else {
        await createCustomer.mutateAsync(base);
        Alert.alert("", t("customer.createSuccess"));
      }
      router.back();
    } catch {
      Alert.alert(t("common.error"), t("common.error"));
    }
  }, [isEditMode, customerId, existingCustomer?.completionDate, createCustomer, updateCustomer, router, t, toNumber, toNumberOptional]);

  useEffect(() => {
    if (scanError) Alert.alert("Kartvizit Tarama", scanError);
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

  // renderCustomerTypeItem KALDIRILDI

  const FormSection = ({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) => {
    const hasChildren = React.Children.count(children) > 0;
    if (!hasChildren) return null;

    return (
      <View 
        style={[
          styles.card, 
          { 
            backgroundColor: THEME.cardBg, 
            borderColor: THEME.border, 
            shadowColor: THEME.shadow,
            shadowOpacity: isDark ? 0.4 : 0.06, 
            shadowRadius: isDark ? 16 : 12,
            elevation: isDark ? 0 : 3,
          }
        ]}
      >
        <View style={[
            styles.sectionHeader, 
            { borderBottomColor: THEME.border, borderBottomWidth: 1, paddingBottom: 12 }
        ]}>
          {icon && (
            <View style={[styles.sectionIcon, { backgroundColor: isDark ? 'rgba(219, 39, 119, 0.15)' : '#FFF1F2' }]}>
              {icon}
            </View>
          )}
          <Text style={[styles.sectionTitle, { color: THEME.text }]}>{title}</Text>
        </View>
        <View style={{ gap: 16 }}>{children}</View>
      </View>
    );
  };

  if (isEditMode && customerLoading) {
    return (
      <>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={[styles.container, { backgroundColor: mainBg }]}>
          <ScreenHeader title={t("customer.edit")} showBackButton />
          <View style={[styles.content, { backgroundColor: 'transparent' }]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ 
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255,255,255,0.9)', 
            borderBottomWidth: 1, 
            borderBottomColor: THEME.border 
        }}>
          <ScreenHeader title={isEditMode ? t("customer.edit") : t("customer.create")} showBackButton />
        </View>
        
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView
            style={{ flex: 1, backgroundColor: 'transparent' }}
            contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {(!isEditMode && formConfig.showBusinessCardScan) && (
              <View style={[styles.scannerContainer, { borderColor: THEME.primary, backgroundColor: `${THEME.primary}08` }]}>
                <View style={styles.scannerContent}>
                  <View style={[styles.scannerIconBox, { backgroundColor: THEME.primary }]}>
                     <Camera01Icon size={24} color="#FFF" variant="stroke" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scannerTitle, { color: THEME.text }]}>Kartvizit Tara</Text>
                    <Text style={[styles.scannerSubtitle, { color: THEME.textMute }]}>Bilgileri kamerayla otomatik doldur</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.scannerButton, { borderColor: THEME.primary }]}
                    onPress={handleScanBusinessCard}
                    disabled={isScanning}
                  >
                    {isScanning ? <ActivityIndicator size="small" color={THEME.primary} /> : <Text style={{color: THEME.primary, fontWeight: '700', fontSize: 13}}>TARA</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <FormSection title="Genel Bilgiler" icon={<UserCircleIcon size={20} color={THEME.primary} variant="stroke" />}>
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

              {formConfig.showCustomerCode && (
                <Controller
                  control={control}
                  name="customerCode"
                  render={({ field: { value } }) => (
                    <View style={{ opacity: 0.6 }}>
                        <FormField 
                        label={t("customer.customerCode")} 
                        value={value || ""} 
                        onChangeText={() => {}} 
                        maxLength={100} 
                        editable={false} 
                        />
                    </View>
                  )}
                />
              )}

              {/* BURASI GÜNCELLENDİ: PremiumPicker Kullanımı */}
              {formConfig.showCustomerType && (
                <View style={styles.fieldContainer}>
                  <Controller
                    control={control}
                    name="customerTypeId"
                    render={({ field: { onChange, value } }) => (
                        <PremiumPicker
                            label={t("customer.customerType")}
                            items={customerTypeOptions}
                            value={value}
                            onValueChange={onChange}
                            placeholder={t("lookup.selectCustomerType")}
                            error={errors.customerTypeId?.message}
                        />
                    )}
                  />
                </View>
              )}
            </FormSection>

            {(formConfig.showPhone || formConfig.showPhone2 || formConfig.showEmail || formConfig.showWebsite) && (
              <FormSection title="İletişim Bilgileri" icon={<ContactBookIcon size={20} color={THEME.primary} variant="stroke" />}>
                {formConfig.showPhone && (
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, value } }) => <FormField label={t("customer.phone")} value={value || ""} onChangeText={onChange} keyboardType="phone-pad" maxLength={100} />}
                  />
                )}

                {formConfig.showPhone2 && (
                  <Controller
                    control={control}
                    name="phone2"
                    render={({ field: { onChange, value } }) => <FormField label={t("customer.phone2")} value={value || ""} onChangeText={onChange} keyboardType="phone-pad" maxLength={100} />}
                  />
                )}

                {formConfig.showEmail && (
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
                )}

                {formConfig.showWebsite && (
                  <Controller
                    control={control}
                    name="website"
                    render={({ field: { onChange, value } }) => <FormField label={t("customer.website")} value={value || ""} onChangeText={onChange} autoCapitalize="none" maxLength={100} />}
                  />
                )}
              </FormSection>
            )}

            {(formConfig.showSalesRep || formConfig.showGroupCode || formConfig.showCreditLimit || formConfig.showBranchCode || formConfig.showBusinessUnit) && (
              <FormSection title="Ticari Detaylar" icon={<Briefcase01Icon size={20} color={THEME.primary} variant="stroke" />}>
                {formConfig.showSalesRep && (
                  <Controller
                    control={control}
                    name="salesRepCode"
                    render={({ field: { onChange, value } }) => <FormField label={t("customer.salesRepCode")} value={value || ""} onChangeText={onChange} maxLength={50} />}
                  />
                )}

                {formConfig.showGroupCode && (
                  <Controller
                    control={control}
                    name="groupCode"
                    render={({ field: { onChange, value } }) => <FormField label={t("customer.groupCode")} value={value || ""} onChangeText={onChange} maxLength={50} />}
                  />
                )}

                {formConfig.showCreditLimit && (
                  <Controller
                    control={control}
                    name="creditLimit"
                    render={({ field: { onChange, value } }) => (
                      <FormField
                        label={t("customer.creditLimit")}
                        value={value !== undefined && value !== null ? String(value) : ""}
                        onChangeText={(text) => onChange(text ? Number(text) : undefined)}
                        keyboardType="numeric"
                      />
                    )}
                  />
                )}

                {formConfig.showBranchCode && (
                  <Controller
                    control={control}
                    name="branchCode"
                    render={({ field: { onChange, value } }) => (
                      <FormField
                        label={t("customer.branchCode")}
                        value={value !== undefined && value !== null ? String(value) : ""}
                        onChangeText={(text) => onChange(text ? Number(text) : 0)}
                        keyboardType="numeric"
                      />
                    )}
                  />
                )}

                {formConfig.showBusinessUnit && (
                  <Controller
                    control={control}
                    name="businessUnitCode"
                    render={({ field: { onChange, value } }) => (
                      <FormField
                        label={t("customer.businessUnitCode")}
                        value={value !== undefined && value !== null ? String(value) : ""}
                        onChangeText={(text) => onChange(text ? Number(text) : 0)}
                        keyboardType="numeric"
                      />
                    )}
                  />
                )}
              </FormSection>
            )}

            {(formConfig.showAddress || formConfig.showLocation || formConfig.showShippingAddress) && (
              <FormSection title="Adres Bilgileri" icon={<Location01Icon size={20} color={THEME.primary} variant="stroke" />}>
                {formConfig.showAddress && (
                  <Controller
                    control={control}
                    name="address"
                    render={({ field: { onChange, value } }) => <FormField label={t("customer.address")} value={value || ""} onChangeText={onChange} multiline numberOfLines={3} maxLength={500} />}
                  />
                )}

                {formConfig.showLocation && (
                  <View style={styles.locationSection}>
                    <Text style={[styles.subSectionTitle, { color: THEME.textMute }]}>{t("lookup.location")}</Text>
                    <LocationPicker
                      countryId={watchCountryId}
                      cityId={watchCityId}
                      districtId={watch("districtId")}
                      onCountryChange={handleCountryChange}
                      onCityChange={handleCityChange}
                      onDistrictChange={handleDistrictChange}
                    />
                  </View>
                )}

                {formConfig.showShippingAddress && (
                  <View style={styles.fieldContainer}>
                    <Text style={[styles.label, { color: THEME.textMute }]}>{t("customer.defaultShippingAddress")}</Text>
                    <TouchableOpacity
                      style={[styles.pickerField, { backgroundColor: THEME.inputBg, borderColor: THEME.border }]}
                      onPress={() => setShippingAddressModalOpen(true)}
                      disabled={!isEditMode || !customerId}
                    >
                      <Text style={[styles.pickerFieldText, { color: selectedShippingAddress ? THEME.text : THEME.textMute }]}>
                        {selectedShippingAddress?.address || t("customer.defaultShippingAddressPlaceholder")}
                      </Text>
                      <ArrowDown01Icon size={16} color={THEME.textMute} />
                    </TouchableOpacity>
                  </View>
                )}
              </FormSection>
            )}

            {(formConfig.showTaxNumber || formConfig.showTaxOffice || formConfig.showTCKN) && (
              <FormSection title="Yasal Bilgiler" icon={<Invoice01Icon size={20} color={THEME.primary} variant="stroke" />}>
                {formConfig.showTaxNumber && (
                  <Controller
                    control={control}
                    name="taxNumber"
                    render={({ field: { onChange, value } }) => <FormField label={t("customer.taxNumber")} value={value || ""} onChangeText={onChange} keyboardType="numeric" maxLength={15} />}
                  />
                )}
                {formConfig.showTaxOffice && (
                  <Controller
                    control={control}
                    name="taxOffice"
                    render={({ field: { onChange, value } }) => <FormField label={t("customer.taxOffice")} value={value || ""} onChangeText={onChange} maxLength={100} />}
                  />
                )}
                {formConfig.showTCKN && (
                  <Controller
                    control={control}
                    name="tcknNumber"
                    render={({ field: { onChange, value } }) => <FormField label={t("customer.tcknNumber")} value={value || ""} onChangeText={onChange} keyboardType="numeric" maxLength={11} />}
                  />
                )}
              </FormSection>
            )}

            {formConfig.showNotes && (
              <FormSection title="Notlar" icon={<NoteIcon size={20} color={THEME.primary} variant="stroke" />}>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, value } }) => <FormField label={t("customer.notes")} value={value || ""} onChangeText={onChange} multiline numberOfLines={3} maxLength={250} />}
                />
              </FormSection>
            )}

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleSubmit(onSubmit)} 
              disabled={isSubmitting}
              style={[styles.submitButtonContainer, { shadowColor: THEME.primary }]}
            >
              <LinearGradient
                colors={['#f472b6', '#db2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEditMode ? t("common.update") : t("common.save")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* CUSTOMER TYPE MODAL SİLİNDİ (Burada artık sadece Shipping modal var) */}

      <Modal visible={shippingAddressModalOpen} transparent animationType="slide" onRequestClose={() => setShippingAddressModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShippingAddressModalOpen(false)} />
          <View style={[styles.modalContent, { backgroundColor: THEME.cardBg, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: THEME.border }]}>
              <View style={[styles.handle, { backgroundColor: THEME.border }]} />
              <Text style={[styles.modalTitle, { color: THEME.text }]}>{t("customer.defaultShippingAddress")}</Text>
            </View>
            <FlatList
              data={customerShippingAddresses}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const isSelected = watchDefaultShippingAddressId === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.pickerItem, { borderBottomColor: THEME.border }, isSelected && { backgroundColor: isDark ? "rgba(219, 39, 119, 0.1)" : colors.activeBackground }]}
                    onPress={() => handleShippingAddressSelect(item.id)}
                  >
                    <Text style={[styles.pickerItemText, { color: THEME.text }]}>{item.address}</Text>
                    {isSelected && <CheckmarkCircle02Icon size={20} color={THEME.primary} variant="stroke" />}
                  </TouchableOpacity>
                );
              }}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={{ padding: 20 }}>
                  <Text style={{ color: THEME.textMute }}>{t("customer.noShippingAddress")}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  contentContainer: { padding: 16, gap: 20 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    borderRadius: 20, 
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, 
    gap: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scannerContainer: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 20,
    marginBottom: 4,
  },
  scannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  scannerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  scannerButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  fieldContainer: { marginBottom: 0 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  pickerField: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    borderWidth: 1, 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    height: 54 
  },
  pickerFieldText: { fontSize: 15, flex: 1 },
  locationSection: { marginTop: 4 },
  
  submitButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 20,
    gap: 10,
  },
  submitButtonText: { 
    color: "#FFFFFF", 
    fontSize: 17, 
    fontWeight: "700", 
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)" }, 
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "75%" },
  modalHeader: { alignItems: "center", paddingVertical: 18, borderBottomWidth: 1 },
  handle: { width: 44, height: 5, borderRadius: 2.5, marginBottom: 14, opacity: 0.4 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  list: { flexGrow: 0 },
  pickerItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18, paddingHorizontal: 22, borderBottomWidth: 1 },
  pickerItemText: { fontSize: 16, fontWeight: "500", flex: 1 },
});