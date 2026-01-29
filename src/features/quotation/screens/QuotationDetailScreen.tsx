import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { FormField } from "../../activity/components";
import { useCustomer } from "../../customer/hooks";
import { useCustomerShippingAddresses } from "../../shipping-address/hooks";
import {
  useQuotationDetail,
  useUpdateQuotationBulk,
  useStartApprovalFlow,
  useExchangeRate,
  useCurrencyOptions,
  usePaymentTypes,
  useRelatedUsers,
} from "../hooks";
import {
  ExchangeRateDialog,
  PickerModal,
  CustomerSelectDialog,
  DocumentSerialTypePicker,
  OfferTypePicker,
  QuotationDetailLineRow,
} from "../components";
import { createQuotationSchema, type CreateQuotationSchema } from "../schemas";
import type { CustomerDto } from "../../customer/types";
import type { QuotationLineFormState, QuotationExchangeRateFormState } from "../types";
import type { ExchangeRateDto } from "../types";
import {
  mapDetailHeaderToForm,
  mapDetailLinesToFormState,
  mapDetailRatesToFormState,
  groupQuotationLines,
  totalsFromDetailLines,
} from "../utils";

export function QuotationDetailScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const showToast = useToastStore((s) => s.showToast);

  const quotationId = id != null && id !== "" ? Number(id) : undefined;
  const {
    header,
    lines: linesData,
    exchangeRates: ratesData,
    isLoading: detailLoading,
    isError: detailError,
    error: detailErrorObj,
    refetch,
  } = useQuotationDetail(quotationId);

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const formInitRef = useRef(false);
  const linesInitRef = useRef(false);
  const ratesInitRef = useRef(false);
  const erpRatesFilledRef = useRef(false);

  const [lines, setLines] = useState<QuotationLineFormState[]>([]);
  const [exchangeRates, setExchangeRates] = useState<QuotationExchangeRateFormState[]>([]);
  const [erpRatesForQuotation, setErpRatesForQuotation] = useState<ExchangeRateDto[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | undefined>();
  const [deliveryDateModalOpen, setDeliveryDateModalOpen] = useState(false);
  const [offerDateModalOpen, setOfferDateModalOpen] = useState(false);
  const [tempDeliveryDate, setTempDeliveryDate] = useState(new Date());
  const [tempOfferDate, setTempOfferDate] = useState(new Date());
  const [exchangeRateDialogVisible, setExchangeRateDialogVisible] = useState(false);
  const [paymentTypeModalVisible, setPaymentTypeModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [shippingAddressModalVisible, setShippingAddressModalVisible] = useState(false);
  const [customerSelectDialogOpen, setCustomerSelectDialogOpen] = useState(false);
  const [representativeModalVisible, setRepresentativeModalVisible] = useState(false);

  const schema = useMemo(() => createQuotationSchema(), []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuotationSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      quotation: {
        offerType: "Domestic",
        currency: "",
        offerDate: new Date().toISOString().split("T")[0],
        deliveryDate: new Date().toISOString().split("T")[0],
        representativeId: user?.id ?? null,
      },
    },
  });

  const watchedCurrency = watch("quotation.currency");
  const watchedCustomerId = watch("quotation.potentialCustomerId");
  const watchedErpCustomerCode = watch("quotation.erpCustomerCode");
  const watchedRepresentativeId = watch("quotation.representativeId");
  const watchedOfferDate = watch("quotation.offerDate");
  const watchedDeliveryDate = watch("quotation.deliveryDate");

  const { data: customer } = useCustomer(watchedCustomerId ?? undefined);
  const { data: shippingAddresses } = useCustomerShippingAddresses(watchedCustomerId ?? undefined);
  const exchangeRateParams = useMemo(
    () => ({ tarih: new Date().toISOString().split("T")[0], fiyatTipi: 1 as const }),
    []
  );
  const { data: exchangeRatesData, isLoading: isLoadingErpRates } = useExchangeRate(exchangeRateParams);
  const { data: currencyOptions } = useCurrencyOptions(exchangeRateParams);
  const { data: paymentTypes } = usePaymentTypes();
  const { data: relatedUsers = [] } = useRelatedUsers(user?.id);

  const customerTypeId = useMemo(() => {
    if (watchedErpCustomerCode) return 0;
    return customer?.customerTypeId ?? undefined;
  }, [watchedErpCustomerCode, customer?.customerTypeId]);

  const lineGroups = useMemo(() => groupQuotationLines(linesData), [linesData]);
  const apiTotals = useMemo(() => totalsFromDetailLines(linesData), [linesData]);
  const displayCurrency = header?.currency ?? watchedCurrency ?? "";

  const updateBulk = useUpdateQuotationBulk();
  const startApproval = useStartApprovalFlow();

  useEffect(() => {
    if (exchangeRatesData?.length && !erpRatesFilledRef.current) {
      setErpRatesForQuotation(exchangeRatesData);
      erpRatesFilledRef.current = true;
    }
  }, [exchangeRatesData]);

  useEffect(() => {
    if (!header || formInitRef.current) return;
    reset({ quotation: mapDetailHeaderToForm(header) });
    formInitRef.current = true;
  }, [header, reset]);

  useEffect(() => {
    if (linesInitRef.current) return;
    if (header == null) return;
    setLines(linesData.length > 0 ? mapDetailLinesToFormState(linesData) : []);
    linesInitRef.current = true;
  }, [header, linesData]);

  useEffect(() => {
    if (ratesInitRef.current) return;
    if (header == null || !currencyOptions?.length) return;
    const mapped =
      ratesData.length > 0 ? mapDetailRatesToFormState(ratesData, currencyOptions) : [];
    setExchangeRates(mapped);
    ratesInitRef.current = true;
  }, [header, ratesData, currencyOptions]);

  useEffect(() => {
    if (customer) setSelectedCustomer(customer);
  }, [customer]);

  useEffect(() => {
    if (deliveryDateModalOpen && watchedDeliveryDate) {
      setTempDeliveryDate(new Date(watchedDeliveryDate + "T12:00:00"));
    }
  }, [deliveryDateModalOpen, watchedDeliveryDate]);

  useEffect(() => {
    if (offerDateModalOpen && watchedOfferDate) {
      setTempOfferDate(new Date(watchedOfferDate + "T12:00:00"));
    }
  }, [offerDateModalOpen, watchedOfferDate]);

  useEffect(() => {
    if (lines.length > 0) clearErrors("root");
  }, [lines.length, clearErrors]);

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

  const handleDeliveryDateChange = useCallback(
    (_: DateTimePickerEvent, d?: Date) => {
      if (d) {
        setTempDeliveryDate(d);
        setValue("quotation.deliveryDate", d.toISOString().split("T")[0]);
      }
    },
    [setValue]
  );

  const handleOfferDateChange = useCallback(
    (_: DateTimePickerEvent, d?: Date) => {
      if (d) {
        setTempOfferDate(d);
        setValue("quotation.offerDate", d.toISOString().split("T")[0]);
      }
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (formData: CreateQuotationSchema) => {
      if (!quotationId) return;
      if (lines.length === 0) {
        setError("root", { type: "manual", message: "En az 1 satır eklenmelidir." });
        return;
      }
      const cleanedLines = lines.map((line) => {
        const { id, isEditing, relatedLines, ...rest } = line;
        return {
          ...rest,
          quotationId,
          productId: rest.productId ?? null,
          pricingRuleHeaderId:
            rest.pricingRuleHeaderId != null && rest.pricingRuleHeaderId > 0
              ? rest.pricingRuleHeaderId
              : null,
          relatedStockId:
            rest.relatedStockId != null && rest.relatedStockId > 0 ? rest.relatedStockId : null,
        };
      });
      const cleanedRates = exchangeRates.map((r) => {
        const { id, dovizTipi, ...rest } = r;
        return { ...rest, quotationId, isOfficial: rest.isOfficial ?? true };
      });
      updateBulk.mutate({
        id: quotationId,
        data: {
          quotation: { ...formData.quotation },
          lines: cleanedLines,
          exchangeRates: cleanedRates.length > 0 ? cleanedRates : undefined,
        },
      });
    },
    [quotationId, lines, exchangeRates, updateBulk, setError]
  );

  const handleStartApproval = useCallback(() => {
    if (!quotationId) return;
    Alert.alert(
      t("quotation.sendForApproval"),
      t("quotation.sendForApprovalConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" as const },
        { text: t("common.confirm"), onPress: () => startApproval.mutate(quotationId) },
      ]
    );
  }, [quotationId, startApproval, t]);

  const pageTitle = header?.offerNo ?? (quotationId != null ? `#${quotationId}` : t("quotation.detail"));
  const showOnayButton = header && (header.status === 0 || header.status === null);

  if (!quotationId) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("quotation.detail")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.centered}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={[styles.errText, { color: colors.error }]}>
                  {t("quotation.invalidId")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    );
  }

  if (detailLoading && !header) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("quotation.detail")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          </View>
        </View>
      </>
    );
  }

  if (detailError && !header) {
    return (
      <>
        <StatusBar style="light" />
        <View style={[styles.container, { backgroundColor: colors.header }]}>
          <ScreenHeader title={t("quotation.detail")} showBackButton />
          <View style={[styles.content, { backgroundColor: contentBackground }]}>
            <View style={styles.centered}>
              <Text style={[styles.errText, { color: colors.error }]}>
                {detailErrorObj?.message ?? t("common.error")}
              </Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.accent }]}
                onPress={() => refetch()}
              >
                <Text style={styles.retryBtnText}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.header }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScreenHeader title={pageTitle} showBackButton />
        <ScrollView
          style={[styles.content, { backgroundColor: contentBackground }]}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("quotation.customerSection")}
            </Text>
            <TouchableOpacity
              style={[
                styles.customerBtn,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: errors.quotation?.potentialCustomerId ? colors.error : colors.border,
                },
              ]}
              onPress={() => setCustomerSelectDialogOpen(true)}
            >
              <View style={styles.customerBtnInner}>
                <Text style={styles.customerIcon}>👤</Text>
                <View style={styles.customerTextWrap}>
                  <Text style={[styles.customerLabel, { color: colors.textSecondary }]}>
                    {t("quotation.selectCustomer")}
                  </Text>
                  <Text style={[styles.customerValue, { color: colors.text }]} numberOfLines={1}>
                    {selectedCustomer?.name ??
                      (watchedErpCustomerCode ? `ERP: ${watchedErpCustomerCode}` : t("quotation.selectCustomerPlaceholder"))}
                  </Text>
                </View>
              </View>
              <Text style={[styles.customerArrow, { color: colors.textMuted }]}>›</Text>
            </TouchableOpacity>
            {errors.quotation?.potentialCustomerId?.message && (
              <Text style={[styles.fieldErr, { color: colors.error }]}>
                {errors.quotation.potentialCustomerId.message}
              </Text>
            )}
            {watchedCustomerId && shippingAddresses && shippingAddresses.length > 0 && (
              <Controller
                control={control}
                name="quotation.shippingAddressId"
                render={({ field: { value } }) => (
                  <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      {t("quotation.shippingAddress")}
                    </Text>
                    <TouchableOpacity
                      style={[styles.pickerBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                      onPress={() => setShippingAddressModalVisible(true)}
                    >
                      <Text style={[styles.pickerTxt, { color: colors.text }]}>
                        {shippingAddresses.find((a) => a.id === value)?.address ?? t("quotation.select")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("quotation.quotationInfo")}
            </Text>
            <OfferTypePicker control={control} />
            <Controller
              control={control}
              name="quotation.representativeId"
              render={() => (
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {t("quotation.representative")}
                  </Text>
                  <TouchableOpacity
                    style={[styles.pickerBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                    onPress={() => setRepresentativeModalVisible(true)}
                  >
                    <Text style={[styles.pickerTxt, { color: colors.text }]}>
                      {watchedRepresentativeId
                        ? (() => {
                            const u = relatedUsers.find((u) => u.userId === watchedRepresentativeId);
                            return u ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : String(watchedRepresentativeId);
                          })()
                        : t("quotation.select")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <Controller
              control={control}
              name="quotation.paymentTypeId"
              render={() => (
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {t("quotation.paymentType")} <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.pickerBtn,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: errors.quotation?.paymentTypeId ? colors.error : colors.border,
                      },
                    ]}
                    onPress={() => setPaymentTypeModalVisible(true)}
                  >
                    <Text style={[styles.pickerTxt, { color: colors.text }]}>
                      {paymentTypes?.find((p) => p.id === watch("quotation.paymentTypeId"))?.name ?? t("quotation.select")}
                    </Text>
                  </TouchableOpacity>
                  {errors.quotation?.paymentTypeId?.message && (
                    <Text style={[styles.fieldErr, { color: colors.error }]}>
                      {errors.quotation.paymentTypeId.message}
                    </Text>
                  )}
                </View>
              )}
            />
            <View style={styles.field}>
              <TouchableOpacity
                style={[
                  styles.dateBtn,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: errors.quotation?.deliveryDate ? colors.error : colors.border,
                  },
                ]}
                onPress={() => setDeliveryDateModalOpen(true)}
              >
                <Text style={[styles.dateBtnTxt, { color: colors.text }]}>
                  {t("quotation.deliveryDate")}: {watchedDeliveryDate ?? t("quotation.select")}
                </Text>
              </TouchableOpacity>
              {errors.quotation?.deliveryDate?.message && (
                <Text style={[styles.fieldErr, { color: colors.error }]}>
                  {errors.quotation.deliveryDate.message}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.dateBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
              onPress={() => setOfferDateModalOpen(true)}
            >
              <Text style={[styles.dateBtnTxt, { color: colors.text }]}>
                {t("quotation.offerDate")}: {watchedOfferDate ?? t("quotation.select")}
              </Text>
            </TouchableOpacity>
            <Controller
              control={control}
              name="quotation.currency"
              render={({ field: { value } }) => (
                <View style={styles.field}>
                  <View style={styles.currencyRow}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      {t("quotation.currency")} <Text style={{ color: colors.error }}>*</Text>
                    </Text>
                    {value && (
                      <TouchableOpacity
                        style={[styles.kurlarBtn, { backgroundColor: colors.accent }]}
                        onPress={() => setExchangeRateDialogVisible(true)}
                      >
                        <Text style={styles.kurlarBtnTxt}>💱 {t("quotation.exchangeRates")}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.pickerBtn,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: errors.quotation?.currency ? colors.error : colors.border,
                      },
                    ]}
                    onPress={() => setCurrencyModalVisible(true)}
                  >
                    <Text style={[styles.pickerTxt, { color: colors.text }]}>
                      {currencyOptions?.find((c) => c.code === value)?.dovizIsmi ?? t("quotation.select")}
                    </Text>
                  </TouchableOpacity>
                  {errors.quotation?.currency?.message && (
                    <Text style={[styles.fieldErr, { color: colors.error }]}>
                      {errors.quotation.currency.message}
                    </Text>
                  )}
                </View>
              )}
            />
            <DocumentSerialTypePicker
              control={control}
              customerTypeId={customerTypeId}
              representativeId={watchedRepresentativeId ?? undefined}
              disabled={customerTypeId === undefined || !watchedRepresentativeId}
            />
            <FormField
              label={t("quotation.description")}
              value={watch("quotation.description") || ""}
              onChangeText={(txt) => setValue("quotation.description", txt || null)}
              placeholder={t("quotation.descriptionPlaceholder")}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("quotation.lines")}</Text>
            {linesData.length === 0 ? (
              <Text style={[styles.emptyTxt, { color: colors.textMuted }]}>
                {t("quotation.noLinesYet")}
              </Text>
            ) : (
              <FlatList
                data={lineGroups}
                keyExtractor={(g) => g.key}
                scrollEnabled={false}
                renderItem={({ item: g }) => (
                  <View style={styles.lineGroup}>
                    <QuotationDetailLineRow
                      line={g.main}
                      currency={displayCurrency}
                      isMain={g.related.length > 0}
                    />
                    {g.related.length > 0 && (
                      <View style={styles.relatedBlock}>
                        <Text style={[styles.relatedTitle, { color: colors.textMuted }]}>
                          {t("quotation.relatedStocks")}
                        </Text>
                        {g.related.map((ln) => (
                          <QuotationDetailLineRow
                            key={ln.id}
                            line={ln}
                            currency={displayCurrency}
                            isRelated
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}
              />
            )}
          </View>

          {ratesData.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t("quotation.exchangeRates")}
              </Text>
              {ratesData.map((r) => (
                <View key={r.id} style={[styles.rateRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.rateLabel, { color: colors.textMuted }]}>
                    {r.currency} · {t("quotation.rateDate")}{" "}
                    {r.exchangeRateDate
                      ? new Date(r.exchangeRateDate).toLocaleDateString("tr-TR")
                      : "–"}
                  </Text>
                  <Text style={[styles.rateValue, { color: colors.text }]}>
                    {r.exchangeRate.toLocaleString("tr-TR", {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {linesData.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("quotation.summary")}</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t("quotation.subtotal")}:
                </Text>
                <Text style={[styles.summaryVal, { color: colors.text }]}>
                  {apiTotals.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t("quotation.totalVat")}:
                </Text>
                <Text style={[styles.summaryVal, { color: colors.text }]}>
                  {apiTotals.totalVat.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  {t("quotation.grandTotal")}:
                </Text>
                <Text style={[styles.summaryVal, { color: colors.accent, fontWeight: "600" }]}>
                  {apiTotals.grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.submitRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.cancelBtnTxt, { color: colors.text }]}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            {showOnayButton && (
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.success }]}
                onPress={handleStartApproval}
                disabled={startApproval.isPending}
              >
                {startApproval.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnTxt}>{t("quotation.sendForApproval")}</Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.accent },
                (isSubmitting || updateBulk.isPending) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || updateBulk.isPending}
            >
              {isSubmitting || updateBulk.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnTxt}>{t("quotation.save")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal visible={deliveryDateModalOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={() => setDeliveryDateModalOpen(false)} />
            <View style={[styles.modalBox, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("quotation.deliveryDate")}</Text>
              <DateTimePicker
                value={tempDeliveryDate}
                mode="date"
                display="spinner"
                onChange={handleDeliveryDateChange}
                locale="tr-TR"
              />
              <TouchableOpacity
                style={[styles.modalOkBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  setValue("quotation.deliveryDate", tempDeliveryDate.toISOString().split("T")[0]);
                  setDeliveryDateModalOpen(false);
                }}
              >
                <Text style={styles.modalOkTxt}>{t("common.confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={offerDateModalOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={() => setOfferDateModalOpen(false)} />
            <View style={[styles.modalBox, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("quotation.offerDate")}</Text>
              <DateTimePicker
                value={tempOfferDate}
                mode="date"
                display="spinner"
                onChange={handleOfferDateChange}
                locale="tr-TR"
              />
              <TouchableOpacity
                style={[styles.modalOkBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  setValue("quotation.offerDate", tempOfferDate.toISOString().split("T")[0]);
                  setOfferDateModalOpen(false);
                }}
              >
                <Text style={styles.modalOkTxt}>{t("common.confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <ExchangeRateDialog
          visible={exchangeRateDialogVisible}
          exchangeRates={exchangeRates}
          currencyOptions={currencyOptions}
          erpExchangeRates={erpRatesForQuotation}
          isLoadingErpRates={isLoadingErpRates && erpRatesForQuotation.length === 0}
          currencyInUse={linesData.length > 0 ? (watchedCurrency || undefined) : undefined}
          onClose={() => setExchangeRateDialogVisible(false)}
          onSave={(rates) => {
            setExchangeRates(rates);
            setExchangeRateDialogVisible(false);
          }}
          offerDate={watchedOfferDate ?? undefined}
        />

        <CustomerSelectDialog
          open={customerSelectDialogOpen}
          onOpenChange={setCustomerSelectDialogOpen}
          onSelect={handleCustomerSelect}
        />

        <PickerModal
          visible={paymentTypeModalVisible}
          options={paymentTypes?.map((p) => ({ id: p.id, name: p.name })) ?? []}
          selectedValue={watch("quotation.paymentTypeId") ?? undefined}
          onSelect={(o) => {
            setValue("quotation.paymentTypeId", o.id as number);
            setPaymentTypeModalVisible(false);
          }}
          onClose={() => setPaymentTypeModalVisible(false)}
          title={t("quotation.selectPaymentType")}
          searchPlaceholder={t("quotation.searchPaymentType")}
        />

        <PickerModal
          visible={currencyModalVisible}
          options={currencyOptions?.map((c) => ({ id: c.code, name: c.dovizIsmi ?? c.code, code: c.code })) ?? []}
          selectedValue={watch("quotation.currency")}
          onSelect={(o) => {
            setValue("quotation.currency", o.id as string);
            setCurrencyModalVisible(false);
          }}
          onClose={() => setCurrencyModalVisible(false)}
          title={t("quotation.selectCurrency")}
          searchPlaceholder={t("quotation.searchCurrency")}
        />

        <PickerModal
          visible={representativeModalVisible}
          options={relatedUsers.map((u) => ({
            id: u.userId,
            name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
          }))}
          selectedValue={watch("quotation.representativeId") ?? undefined}
          onSelect={(o) => {
            setValue("quotation.representativeId", o.id as number);
            setRepresentativeModalVisible(false);
          }}
          onClose={() => setRepresentativeModalVisible(false)}
          title={t("quotation.selectRepresentative")}
          searchPlaceholder={t("quotation.searchRepresentative")}
        />

        {watchedCustomerId && shippingAddresses && shippingAddresses.length > 0 && (
          <PickerModal
            visible={shippingAddressModalVisible}
            options={shippingAddresses.map((a) => ({ id: a.id, name: a.address ?? "" }))}
            selectedValue={watch("quotation.shippingAddressId") ?? undefined}
            onSelect={(o) => {
              setValue("quotation.shippingAddressId", o.id as number);
              setShippingAddressModalVisible(false);
            }}
            onClose={() => setShippingAddressModalVisible(false)}
            title={t("quotation.selectShippingAddress")}
            searchPlaceholder={t("quotation.searchAddress")}
          />
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  contentContainer: { padding: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  errText: { fontSize: 16, marginBottom: 16, textAlign: "center" },
  retryBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  retryBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  section: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  pickerBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  pickerTxt: { fontSize: 15 },
  dateBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
  dateBtnTxt: { fontSize: 15 },
  currencyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  kurlarBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  kurlarBtnTxt: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  customerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  customerBtnInner: { flexDirection: "row", alignItems: "center", flex: 1 },
  customerIcon: { fontSize: 20, marginRight: 12 },
  customerTextWrap: { flex: 1 },
  customerLabel: { fontSize: 12, marginBottom: 2 },
  customerValue: { fontSize: 15, fontWeight: "500" },
  customerArrow: { fontSize: 20, fontWeight: "300", marginLeft: 8 },
  fieldErr: { fontSize: 12, marginTop: 4, marginBottom: 4 },
  emptyTxt: { fontSize: 14, textAlign: "center", paddingVertical: 20 },
  lineGroup: { marginBottom: 16 },
  relatedBlock: { marginTop: 8, marginLeft: 4 },
  relatedTitle: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rateLabel: { fontSize: 14 },
  rateValue: { fontSize: 14, fontWeight: "600" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 14 },
  summaryVal: { fontSize: 14, fontWeight: "500" },
  submitRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 12, height: 52, alignItems: "center", justifyContent: "center" },
  cancelBtnTxt: { fontSize: 16, fontWeight: "600" },
  submitBtn: { flex: 1, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnTxt: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 16 },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16, paddingHorizontal: 20 },
  modalOkBtn: { marginHorizontal: 20, marginTop: 16, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  modalOkTxt: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
