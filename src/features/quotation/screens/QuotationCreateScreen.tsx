import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useAuthStore } from "../../../store/auth";
import { useToastStore } from "../../../store/toast";
import { CustomerPicker } from "../../activity/components";
import { FormField } from "../../activity/components";
import { useCustomer } from "../../customer/hooks";
import { useCustomerShippingAddresses } from "../../shipping-address/hooks";
import { useErpCustomers } from "../../erp-customer/hooks";
import { useStock } from "../../stocks/hooks";
import {
  useCreateQuotationBulk,
  usePriceRuleOfQuotation,
  useUserDiscountLimitsBySalesperson,
  useExchangeRate,
  useCurrencyOptions,
  usePaymentTypes,
} from "../hooks";
import {
  QuotationLineForm,
  ExchangeRateDialog,
  PickerModal,
  CustomerSelectDialog,
  DocumentSerialTypePicker,
  OfferTypePicker,
} from "../components";
import { createQuotationSchema, type CreateQuotationSchema } from "../schemas";
import type { CustomerDto } from "../../customer/types";
import type {
  QuotationLineFormState,
  QuotationExchangeRateFormState,
  StockGetDto,
} from "../types";
import { calculateLineTotals, calculateTotals } from "../utils";

export function QuotationCreateScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, themeMode } = useUIStore();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((state) => state.showToast);

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const [lines, setLines] = useState<QuotationLineFormState[]>([]);
  const [exchangeRates, setExchangeRates] = useState<QuotationExchangeRateFormState[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | undefined>();
  const [deliveryDateModalOpen, setDeliveryDateModalOpen] = useState(false);
  const [offerDateModalOpen, setOfferDateModalOpen] = useState(false);
  const [tempDeliveryDate, setTempDeliveryDate] = useState(new Date());
  const [tempOfferDate, setTempOfferDate] = useState(new Date());
  const [lineFormVisible, setLineFormVisible] = useState(false);
  const [editingLine, setEditingLine] = useState<QuotationLineFormState | null>(null);
  const [exchangeRateDialogVisible, setExchangeRateDialogVisible] = useState(false);
  const [paymentTypeModalVisible, setPaymentTypeModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [shippingAddressModalVisible, setShippingAddressModalVisible] = useState(false);
  const [customerSelectDialogOpen, setCustomerSelectDialogOpen] = useState(false);

  const schema = useMemo(() => createQuotationSchema(), []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuotationSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      quotation: {
        offerType: "Domestic",
        currency: "",
        offerDate: new Date().toISOString().split("T")[0],
        representativeId: user?.id || null,
      },
    },
  });

  const watchedCurrency = watch("quotation.currency");
  const watchedCustomerId = watch("quotation.potentialCustomerId");
  const watchedErpCustomerCode = watch("quotation.erpCustomerCode");
  const watchedRepresentativeId = watch("quotation.representativeId");
  const watchedOfferDate = watch("quotation.offerDate");
  const watchedDeliveryDate = watch("quotation.deliveryDate");

  const { data: customer } = useCustomer(watchedCustomerId);
  const { data: shippingAddresses } = useCustomerShippingAddresses(watchedCustomerId);
  const { data: erpCustomers } = useErpCustomers(watchedErpCustomerCode || undefined);
  const { data: currencyOptions } = useCurrencyOptions({
    tarih: watchedOfferDate || undefined,
    fiyatTipi: 1,
  });
  const { data: paymentTypes } = usePaymentTypes();

  const exchangeRateParams = useMemo(
    () => ({
      tarih: watchedOfferDate || undefined,
      fiyatTipi: 1,
    }),
    [watchedOfferDate]
  );

  const { data: exchangeRatesData } = useExchangeRate(exchangeRateParams);

  const customerCode = useMemo(() => {
    if (customer?.customerCode) return customer.customerCode;
    if (watchedErpCustomerCode) return watchedErpCustomerCode;
    return undefined;
  }, [customer, watchedErpCustomerCode]);

  const customerTypeId = useMemo(() => {
    if (watchedErpCustomerCode) return 0;
    return customer?.customerTypeId ?? undefined;
  }, [watchedErpCustomerCode, customer?.customerTypeId]);

  const { data: pricingRules } = usePriceRuleOfQuotation({
    customerCode,
    salesmenId: watchedRepresentativeId || undefined,
    quotationDate: watchedOfferDate || undefined,
  });

  const { data: userDiscountLimits } = useUserDiscountLimitsBySalesperson(
    watchedRepresentativeId || undefined
  );

  const createQuotation = useCreateQuotationBulk();

  useEffect(() => {
    if (customer) {
      setSelectedCustomer(customer);
    }
  }, [customer]);

  const totals = useMemo(() => calculateTotals(lines), [lines]);

  const handleCustomerSelect = useCallback(
    (result: { customerId?: number; erpCustomerCode?: string }) => {
      if (result.customerId) {
        setValue("quotation.potentialCustomerId", result.customerId);
        setValue("quotation.erpCustomerCode", null);
        setSelectedCustomer(undefined);
      } else if (result.erpCustomerCode) {
        setValue("quotation.erpCustomerCode", result.erpCustomerCode);
        setValue("quotation.potentialCustomerId", null);
        setSelectedCustomer(undefined);
      }
    },
    [setValue]
  );

  const handleCustomerChange = useCallback(
    (customer: CustomerDto | undefined) => {
      setSelectedCustomer(customer);
      setValue("quotation.potentialCustomerId", customer?.id || null);
      setValue("quotation.erpCustomerCode", null);
    },
    [setValue]
  );

  const handleDeliveryDateChange = useCallback(
    (_: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
        setTempDeliveryDate(selectedDate);
        setValue("quotation.deliveryDate", selectedDate.toISOString().split("T")[0]);
        setDeliveryDateModalOpen(false);
      }
    },
    [setValue]
  );

  const handleOfferDateChange = useCallback(
    (_: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
        setTempOfferDate(selectedDate);
        setValue("quotation.offerDate", selectedDate.toISOString().split("T")[0]);
        setOfferDateModalOpen(false);
      }
    },
    [setValue]
  );

  const handleAddLine = useCallback(() => {
    if ((!watchedCustomerId && !watchedErpCustomerCode) || !watchedRepresentativeId || !watchedCurrency) {
      showToast("error", "Lütfen müşteri, temsilci ve para birimi seçimlerini yapınız.");
      return;
    }

    setEditingLine(null);
    setLineFormVisible(true);
  }, [watchedCustomerId, watchedErpCustomerCode, watchedRepresentativeId, watchedCurrency, showToast]);

  const handleEditLine = useCallback(
    (line: QuotationLineFormState) => {
      setEditingLine(line);
      setLineFormVisible(true);
    },
    []
  );

  const handleSaveLine = useCallback(
    (savedLine: QuotationLineFormState) => {
      if (editingLine) {
        setLines((prev) => prev.map((line) => (line.id === editingLine.id ? savedLine : line)));
      } else {
        setLines((prev) => [...prev, savedLine]);
      }
      setEditingLine(null);
      setLineFormVisible(false);
    },
    [editingLine]
  );

  const handleProductSelectWithRelatedStocks = useCallback(
    (stock: StockGetDto) => {
      if (!stock.id) return;

      const mainLine: QuotationLineFormState = {
        id: `temp-${Date.now()}`,
        productId: stock.id,
        productCode: stock.erpStockCode,
        productName: stock.stockName,
        groupCode: stock.grupKodu || null,
        quantity: 1,
        unitPrice: 0,
        discountRate1: 0,
        discountAmount1: 0,
        discountRate2: 0,
        discountAmount2: 0,
        discountRate3: 0,
        discountAmount3: 0,
        vatRate: 18,
        vatAmount: 0,
        lineTotal: 0,
        lineGrandTotal: 0,
        isMainRelatedProduct: true,
        isEditing: false,
      };

      if (stock.parentRelations && stock.parentRelations.length > 0) {
        const relatedLines: QuotationLineFormState[] = [];
        for (const relation of stock.parentRelations) {
          if (relation.relatedStockId && relation.relatedStockCode) {
            relatedLines.push({
              id: `temp-${Date.now()}-${relation.id}`,
              productCode: relation.relatedStockCode,
              productName: relation.relatedStockName || "",
              quantity: relation.quantity,
              unitPrice: 0,
              discountRate1: 0,
              discountAmount1: 0,
              discountRate2: 0,
              discountAmount2: 0,
              discountRate3: 0,
              discountAmount3: 0,
              vatRate: 18,
              vatAmount: 0,
              lineTotal: 0,
              lineGrandTotal: 0,
              relatedStockId: relation.relatedStockId,
              relatedProductKey: `main-${stock.id}`,
              isMainRelatedProduct: false,
              isEditing: false,
            });
          }
        }
        mainLine.relatedLines = relatedLines;
        setLines((prev) => [...prev, mainLine, ...relatedLines]);
      } else {
        setLines((prev) => [...prev, mainLine]);
      }
    },
    []
  );

  const handleDeleteLine = useCallback(
    (lineId: string) => {
      Alert.alert(t("common.confirm"), t("common.delete"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            setLines((prev) => {
              const lineToDelete = prev.find((line) => line.id === lineId);
              if (lineToDelete?.relatedProductKey) {
                return prev.filter(
                  (line) => line.id !== lineId && line.relatedProductKey !== lineToDelete.relatedProductKey
                );
              }
              if (lineToDelete?.relatedLines && lineToDelete.relatedLines.length > 0) {
                const relatedIds = lineToDelete.relatedLines.map((rl) => rl.id);
                return prev.filter((line) => line.id !== lineId && !relatedIds.includes(line.id));
              }
              return prev.filter((line) => line.id !== lineId);
            });
          },
        },
      ]);
    },
    [t]
  );

  const onSubmit = useCallback(
    async (formData: CreateQuotationSchema) => {
      if (!formData.quotation.paymentTypeId) {
        showToast("error", "Ödeme tipi seçilmelidir");
        return;
      }

      if (!formData.quotation.deliveryDate) {
        showToast("error", "Teslimat tarihi girilmelidir");
        return;
      }

      if (lines.length === 0) {
        showToast("error", "En az 1 satır eklenmelidir");
        return;
      }

      if (!formData.quotation.currency || formData.quotation.currency === "0") {
        showToast("error", "Geçerli bir para birimi seçilmelidir");
        return;
      }

      const cleanedLines = lines.map((line) => {
        const { id, isEditing, relatedLines, ...rest } = line;
        return {
          ...rest,
          quotationId: 0,
          productId: rest.productId || null,
        };
      });

      const cleanedExchangeRates = exchangeRates.map((rate) => {
        const { id, dovizTipi, ...rest } = rate;
        return {
          ...rest,
          quotationId: 0,
          isOfficial: rest.isOfficial ?? true,
        };
      });

      createQuotation.mutate({
        quotation: {
          ...formData.quotation,
          quotationId: 0,
        },
        lines: cleanedLines,
        exchangeRates: cleanedExchangeRates.length > 0 ? cleanedExchangeRates : undefined,
      });
    },
    [lines, exchangeRates, createQuotation, showToast]
  );

  return (
    <>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.header }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScreenHeader title={t("quotation.createNew")} showBackButton />
        <ScrollView
          style={[styles.content, { backgroundColor: contentBackground }]}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Müşteri Bilgileri</Text>

            <TouchableOpacity
              style={[
                styles.customerSelectButton,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              ]}
              onPress={() => setCustomerSelectDialogOpen(true)}
            >
              <View style={styles.customerSelectContent}>
                <Text style={styles.customerSelectIcon}>👤</Text>
                <View style={styles.customerSelectTextContainer}>
                  <Text style={[styles.customerSelectLabel, { color: colors.textSecondary }]}>
                    Müşteri Seç
                  </Text>
                  <Text
                    style={[styles.customerSelectValue, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {selectedCustomer?.name ||
                      (watchedErpCustomerCode ? `ERP: ${watchedErpCustomerCode}` : "Müşteri seçiniz")}
                  </Text>
                </View>
              </View>
              <Text style={[styles.customerSelectArrow, { color: colors.textMuted }]}>›</Text>
            </TouchableOpacity>

            {watchedCustomerId && shippingAddresses && shippingAddresses.length > 0 && (
              <Controller
                control={control}
                name="quotation.shippingAddressId"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.fieldContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Teslimat Adresi
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.pickerButton,
                        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                      ]}
                      onPress={() => setShippingAddressModalVisible(true)}
                    >
                      <Text style={[styles.pickerText, { color: colors.text }]}>
                        {shippingAddresses.find((addr) => addr.id === value)?.addressText || "Seçiniz"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Teklif Bilgileri</Text>

            <OfferTypePicker control={control} />

            <Controller
              control={control}
              name="quotation.representativeId"
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Temsilci</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text },
                    ]}
                    value={value ? String(value) : ""}
                    onChangeText={(text) => onChange(text ? Number(text) : null)}
                    placeholder="Temsilci ID"
                    keyboardType="numeric"
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="quotation.paymentTypeId"
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Ödeme Tipi <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    ]}
                    onPress={() => setPaymentTypeModalVisible(true)}
                  >
                    <Text style={[styles.pickerText, { color: colors.text }]}>
                      {paymentTypes?.find((pt) => pt.id === value)?.name || "Seçiniz"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity
              style={[
                styles.dateButton,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              ]}
              onPress={() => setDeliveryDateModalOpen(true)}
            >
              <Text style={[styles.dateButtonText, { color: colors.text }]}>
                Teslimat Tarihi: {watchedDeliveryDate || "Seçiniz"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateButton,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              ]}
              onPress={() => setOfferDateModalOpen(true)}
            >
              <Text style={[styles.dateButtonText, { color: colors.text }]}>
                Teklif Tarihi: {watchedOfferDate || "Seçiniz"}
              </Text>
            </TouchableOpacity>

            <Controller
              control={control}
              name="quotation.currency"
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldContainer}>
                  <View style={styles.currencyHeader}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      Para Birimi <Text style={{ color: colors.error }}>*</Text>
                    </Text>
                    {value && (
                      <TouchableOpacity
                        style={[styles.exchangeRateButton, { backgroundColor: colors.accent }]}
                        onPress={() => setExchangeRateDialogVisible(true)}
                      >
                        <Text style={styles.exchangeRateButtonText}>💱 Kurlar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    ]}
                    onPress={() => setCurrencyModalVisible(true)}
                  >
                    <Text style={[styles.pickerText, { color: colors.text }]}>
                      {currencyOptions?.find((c) => c.code === value)?.dovizIsmi || "Seçiniz"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <DocumentSerialTypePicker
              control={control}
              customerTypeId={customerTypeId}
              representativeId={watchedRepresentativeId || undefined}
              disabled={customerTypeId === undefined || !watchedRepresentativeId}
            />

            <FormField
              label="Açıklama"
              value={watch("quotation.description") || ""}
              onChangeText={(text) => setValue("quotation.description", text || null)}
              placeholder="Teklif açıklaması"
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Satırlar</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.accent }]}
                onPress={handleAddLine}
              >
                <Text style={styles.addButtonText}>+ Satır Ekle</Text>
              </TouchableOpacity>
            </View>

            {lines.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Henüz satır eklenmedi
              </Text>
            ) : (
              lines
                .filter((line) => !line.relatedProductKey)
                .map((line) => (
                  <View key={line.id}>
                    <View
                      style={[
                        styles.lineCard,
                        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                        line.approvalStatus === 1 && {
                          borderColor: colors.warning,
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <View style={styles.lineCardHeader}>
                        <View style={styles.lineCardContent}>
                          <Text style={[styles.lineProductName, { color: colors.text }]} numberOfLines={1}>
                            {line.productName || "Ürün seçilmedi"}
                          </Text>
                          <Text style={[styles.lineProductCode, { color: colors.textSecondary }]}>
                            {line.productCode}
                          </Text>
                          <View style={styles.lineDetails}>
                            <Text style={[styles.lineDetailText, { color: colors.textSecondary }]}>
                              Miktar: {line.quantity} {line.groupCode ? `(${line.groupCode})` : ""}
                            </Text>
                            <Text style={[styles.lineDetailText, { color: colors.textSecondary }]}>
                              Birim Fiyat: {line.unitPrice.toFixed(2)}
                            </Text>
                            {(line.discountRate1 > 0 ||
                              line.discountRate2 > 0 ||
                              line.discountRate3 > 0) && (
                              <Text style={[styles.lineDetailText, { color: colors.textSecondary }]}>
                                İndirim: %{line.discountRate1} / %{line.discountRate2} / %{line.discountRate3}
                              </Text>
                            )}
                            <Text style={[styles.lineTotal, { color: colors.accent }]}>
                              Toplam: {line.lineGrandTotal.toFixed(2)}
                            </Text>
                          </View>
                          {line.approvalStatus === 1 && (
                            <View style={[styles.approvalBadge, { backgroundColor: colors.warning + "20" }]}>
                              <Text style={[styles.approvalBadgeText, { color: colors.warning }]}>
                                ⚠️ Onay Gerekli
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.lineActions}>
                          <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: colors.accent }]}
                            onPress={() => handleEditLine(line)}
                          >
                            <Text style={styles.editButtonText}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.deleteButton, { backgroundColor: colors.error }]}
                            onPress={() => handleDeleteLine(line.id)}
                          >
                            <Text style={styles.deleteButtonText}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {line.relatedLines && line.relatedLines.length > 0 && (
                        <View style={styles.relatedLinesContainer}>
                          <Text style={[styles.relatedLinesTitle, { color: colors.textMuted }]}>
                            İlgili Stoklar:
                          </Text>
                          {line.relatedLines.map((relatedLine) => (
                            <View
                              key={relatedLine.id}
                              style={[
                                styles.relatedLineCard,
                                { backgroundColor: colors.card, borderColor: colors.border },
                              ]}
                            >
                              <Text style={[styles.relatedLineText, { color: colors.textSecondary }]}>
                                {relatedLine.productName} - Miktar: {relatedLine.quantity}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))
            )}
          </View>

          {lines.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Özet</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Ara Toplam:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {totals.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>KDV Toplamı:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {totals.totalVat.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>Genel Toplam:</Text>
                <Text style={[styles.summaryValue, { color: colors.accent, fontWeight: "600" }]}>
                  {totals.grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.accent },
              (isSubmitting || createQuotation.isPending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || createQuotation.isPending}
          >
            {isSubmitting || createQuotation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Teklifi Kaydet</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={deliveryDateModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setDeliveryDateModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setDeliveryDateModalOpen(false)}
            />
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
              ]}
            >
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Teslimat Tarihi</Text>
              </View>
              <DateTimePicker
                value={tempDeliveryDate}
                mode="date"
                display="spinner"
                onChange={handleDeliveryDateChange}
                locale="tr-TR"
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={offerDateModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setOfferDateModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setOfferDateModalOpen(false)}
            />
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
              ]}
            >
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Teklif Tarihi</Text>
              </View>
              <DateTimePicker
                value={tempOfferDate}
                mode="date"
                display="spinner"
                onChange={handleOfferDateChange}
                locale="tr-TR"
              />
            </View>
          </View>
        </Modal>

        <QuotationLineForm
          visible={lineFormVisible}
          line={editingLine}
          onClose={() => {
            setLineFormVisible(false);
            setEditingLine(null);
          }}
          onSave={handleSaveLine}
          currency={watchedCurrency || ""}
          currencyOptions={currencyOptions}
          pricingRules={pricingRules}
          userDiscountLimits={userDiscountLimits}
          exchangeRates={exchangeRatesData}
        />

        <ExchangeRateDialog
          visible={exchangeRateDialogVisible}
          exchangeRates={exchangeRates}
          currencyOptions={currencyOptions}
          erpExchangeRates={exchangeRatesData}
          onClose={() => setExchangeRateDialogVisible(false)}
          onSave={(rates) => {
            setExchangeRates(rates);
            setExchangeRateDialogVisible(false);
          }}
          offerDate={watchedOfferDate || undefined}
        />

        <CustomerSelectDialog
          open={customerSelectDialogOpen}
          onOpenChange={setCustomerSelectDialogOpen}
          onSelect={handleCustomerSelect}
        />

        <PickerModal
          visible={paymentTypeModalVisible}
          options={
            paymentTypes?.map((pt) => ({ id: pt.id, name: pt.name })) || []
          }
          selectedValue={watch("quotation.paymentTypeId")}
          onSelect={(option) => {
            setValue("quotation.paymentTypeId", option.id as number);
            setPaymentTypeModalVisible(false);
          }}
          onClose={() => setPaymentTypeModalVisible(false)}
          title="Ödeme Tipi Seçiniz"
          searchPlaceholder="Ödeme tipi ara..."
        />

        <PickerModal
          visible={currencyModalVisible}
          options={
            currencyOptions?.map((c) => ({
              id: c.code,
              name: c.dovizIsmi,
              code: c.code,
            })) || []
          }
          selectedValue={watch("quotation.currency")}
          onSelect={(option) => {
            setValue("quotation.currency", option.id as string);
            setCurrencyModalVisible(false);
          }}
          onClose={() => setCurrencyModalVisible(false)}
          title="Para Birimi Seçiniz"
          searchPlaceholder="Para birimi ara..."
        />

        {watchedCustomerId && shippingAddresses && shippingAddresses.length > 0 && (
          <PickerModal
            visible={shippingAddressModalVisible}
            options={shippingAddresses.map((addr) => ({
              id: addr.id,
              name: addr.addressText || "",
            }))}
            selectedValue={watch("quotation.shippingAddressId")}
            onSelect={(option) => {
              setValue("quotation.shippingAddressId", option.id as number);
              setShippingAddressModalVisible(false);
            }}
            onClose={() => setShippingAddressModalVisible(false)}
            title="Teslimat Adresi Seçiniz"
            searchPlaceholder="Adres ara..."
          />
        )}
      </KeyboardAvoidingView>
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
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 15,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 15,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  lineCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  lineCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lineCardContent: {
    flex: 1,
    marginRight: 12,
  },
  lineProductName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  lineProductCode: {
    fontSize: 13,
    marginBottom: 8,
  },
  lineDetails: {
    gap: 4,
  },
  lineDetailText: {
    fontSize: 13,
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  approvalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  approvalBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  lineActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 16,
  },
  relatedLinesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  relatedLinesTitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
  relatedLineCard: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  relatedLineText: {
    fontSize: 12,
  },
  currencyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  exchangeRateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  exchangeRateButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  customerSelectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  customerSelectContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  customerSelectIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  customerSelectTextContainer: {
    flex: 1,
  },
  customerSelectLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  customerSelectValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  customerSelectArrow: {
    fontSize: 20,
    fontWeight: "300",
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});
