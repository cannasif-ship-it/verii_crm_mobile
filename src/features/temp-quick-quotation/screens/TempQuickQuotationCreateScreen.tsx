import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useToast } from "../../../hooks/useToast";
import { tempQuickQuotationRepository } from "../repositories/tempQuotattion.repository";
import type {
  TempQuotattionCreateDto,
  TempQuotattionLineCreateDto,
  TempQuotattionLineUpdateDto,
  TempQuotattionExchangeLineCreateDto,
  TempQuotattionExchangeLineUpdateDto,
  TempQuotattionUpdateDto,
} from "../models/tempQuotattion.model";
import { QuotationLineForm, ExchangeRateDialog, PickerModal } from "../../quotation/components";
import type { QuotationLineFormState, QuotationExchangeRateFormState } from "../../quotation/types";
import { useExchangeRate, useCurrencyOptions } from "../../quotation/hooks";

function numberValue(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDbLineId(mixedId: string): number | null {
  if (!mixedId.startsWith("db-")) return null;
  const parsed = Number(mixedId.replace("db-", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function toDbExchangeId(mixedId: string): number | null {
  if (!mixedId.startsWith("dbx-")) return null;
  const parsed = Number(mixedId.replace("dbx-", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function mapFormLineToCreateDto(line: QuotationLineFormState, headerId: number): TempQuotattionLineCreateDto {
  return {
    tempQuotattionId: headerId,
    productCode: line.productCode || "",
    productName: line.productName || "",
    quantity: line.quantity || 0,
    unitPrice: line.unitPrice || 0,
    discountRate1: line.discountRate1 || 0,
    discountAmount1: line.discountAmount1 || 0,
    discountRate2: line.discountRate2 || 0,
    discountAmount2: line.discountAmount2 || 0,
    discountRate3: line.discountRate3 || 0,
    discountAmount3: line.discountAmount3 || 0,
    vatRate: line.vatRate || 0,
    vatAmount: line.vatAmount || 0,
    lineTotal: line.lineTotal || 0,
    lineGrandTotal: line.lineGrandTotal || 0,
    description: line.description || "",
  };
}

function mapFormLineToUpdateDto(line: QuotationLineFormState): TempQuotattionLineUpdateDto {
  return {
    productCode: line.productCode || "",
    productName: line.productName || "",
    quantity: line.quantity || 0,
    unitPrice: line.unitPrice || 0,
    discountRate1: line.discountRate1 || 0,
    discountAmount1: line.discountAmount1 || 0,
    discountRate2: line.discountRate2 || 0,
    discountAmount2: line.discountAmount2 || 0,
    discountRate3: line.discountRate3 || 0,
    discountAmount3: line.discountAmount3 || 0,
    vatRate: line.vatRate || 0,
    vatAmount: line.vatAmount || 0,
    lineTotal: line.lineTotal || 0,
    lineGrandTotal: line.lineGrandTotal || 0,
    description: line.description || "",
  };
}

function mapRateToCreateDto(
  rate: QuotationExchangeRateFormState,
  headerId: number,
  fallbackDate: string
): TempQuotattionExchangeLineCreateDto {
  return {
    tempQuotattionId: headerId,
    currency: rate.currency,
    exchangeRate: rate.exchangeRate || 0,
    exchangeRateDate: rate.exchangeRateDate || fallbackDate,
    isManual: !(rate.isOfficial ?? true),
  };
}

function mapRateToUpdateDto(
  rate: QuotationExchangeRateFormState,
  fallbackDate: string
): TempQuotattionExchangeLineUpdateDto {
  return {
    currency: rate.currency,
    exchangeRate: rate.exchangeRate || 0,
    exchangeRateDate: rate.exchangeRateDate || fallbackDate,
    isManual: !(rate.isOfficial ?? true),
  };
}

export function TempQuickQuotationCreateScreen(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useUIStore();
  const { showError, showSuccess } = useToast();
  const params = useLocalSearchParams<{
    id?: string;
    customerId?: string;
    customerName?: string;
    customerCode?: string;
  }>();
  const editId = params.id ? Number(params.id) : undefined;
  const isEdit = !!editId;
  const preselectedCustomerId = params.customerId ? Number(params.customerId) : undefined;
  const preselectedCustomerName = params.customerName ? String(params.customerName) : "";
  const preselectedCustomerCode = params.customerCode ? String(params.customerCode) : "";
  const hasPreselectedCustomer = !!preselectedCustomerId;

  const [customerId, setCustomerId] = useState(hasPreselectedCustomer ? String(preselectedCustomerId) : "");
  const [currencyCode, setCurrencyCode] = useState("TRY");
  const [exchangeRate, setExchangeRate] = useState("1.00");
  const [description, setDescription] = useState("");
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const [lines, setLines] = useState<QuotationLineFormState[]>([]);
  const [editingLine, setEditingLine] = useState<QuotationLineFormState | null>(null);
  const [lineFormVisible, setLineFormVisible] = useState(false);

  const [exchangeRates, setExchangeRates] = useState<QuotationExchangeRateFormState[]>([]);
  const [exchangeDialogVisible, setExchangeDialogVisible] = useState(false);

  const offerDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const exchangeRateParams = useMemo(() => ({ tarih: offerDate, fiyatTipi: 1 as const }), [offerDate]);
  const { data: erpExchangeRates = [], isLoading: isLoadingErpRates } = useExchangeRate(exchangeRateParams);
  const { data: currencyOptions = [] } = useCurrencyOptions(exchangeRateParams);

  const detailQuery = useQuery({
    queryKey: ["temp-quick-quotation", "detail", editId],
    queryFn: () => tempQuickQuotationRepository.getById(editId as number),
    enabled: isEdit,
  });

  const linesQuery = useQuery({
    queryKey: ["temp-quick-quotation", "lines", editId],
    queryFn: () => tempQuickQuotationRepository.getLinesByHeaderId(editId as number),
    enabled: isEdit,
  });

  const exchangeLinesQuery = useQuery({
    queryKey: ["temp-quick-quotation", "exchange-lines", editId],
    queryFn: () => tempQuickQuotationRepository.getExchangeLinesByHeaderId(editId as number),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!detailQuery.data) return;

    setCustomerId(String(detailQuery.data.customerId ?? ""));
    setCurrencyCode(detailQuery.data.currencyCode || "TRY");
    setExchangeRate(String(detailQuery.data.exchangeRate ?? 1));
    setDescription(detailQuery.data.description || "");
  }, [detailQuery.data]);

  useEffect(() => {
    if (!isEdit && hasPreselectedCustomer) {
      setCustomerId(String(preselectedCustomerId));
      setExchangeRate("1.00");
    }
  }, [isEdit, hasPreselectedCustomer, preselectedCustomerId]);

  useEffect(() => {
    if (isEdit) return;
    if (!currencyOptions || currencyOptions.length === 0) return;
    if (currencyCode && currencyOptions.some((x) => x.code === currencyCode)) return;

    const tryOption = currencyOptions.find((x) => x.code === "TRY");
    setCurrencyCode((tryOption?.code || currencyOptions[0]?.code || "TRY").toUpperCase());
  }, [currencyOptions, currencyCode, isEdit]);

  useEffect(() => {
    const normalized = currencyCode.trim().toUpperCase();
    if (!normalized) return;
    if (normalized === "TRY") {
      setExchangeRate("1.00");
      return;
    }

    const lineRate = exchangeRates.find((x) => x.currency === normalized)?.exchangeRate;
    if (lineRate && lineRate > 0) {
      setExchangeRate(String(lineRate));
      return;
    }

    const erpRate = erpExchangeRates.find((x) => String(x.dovizTipi) === normalized)?.kurDegeri;
    if (erpRate && erpRate > 0) {
      setExchangeRate(String(erpRate));
    }
  }, [currencyCode, exchangeRates, erpExchangeRates]);

  useEffect(() => {
    if (!linesQuery.data) return;

    const mapped: QuotationLineFormState[] = linesQuery.data.map((line) => ({
      id: `db-${line.id}`,
      productId: null,
      productCode: line.productCode,
      productName: line.productName,
      groupCode: null,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountRate1: line.discountRate1,
      discountAmount1: line.discountAmount1,
      discountRate2: line.discountRate2,
      discountAmount2: line.discountAmount2,
      discountRate3: line.discountRate3,
      discountAmount3: line.discountAmount3,
      vatRate: line.vatRate,
      vatAmount: line.vatAmount,
      lineTotal: line.lineTotal,
      lineGrandTotal: line.lineGrandTotal,
      description: line.description,
      isEditing: false,
      relatedStockId: null,
      relatedProductKey: undefined,
      isMainRelatedProduct: true,
      approvalStatus: 0,
    }));

    setLines(mapped);
  }, [linesQuery.data]);

  useEffect(() => {
    if (!exchangeLinesQuery.data) return;

    const mapped: QuotationExchangeRateFormState[] = exchangeLinesQuery.data.map((line) => ({
      id: `dbx-${line.id}`,
      currency: line.currency,
      exchangeRate: line.exchangeRate,
      exchangeRateDate: line.exchangeRateDate,
      isOfficial: !line.isManual,
      dovizTipi: Number(line.currency),
    }));

    setExchangeRates(mapped);
  }, [exchangeLinesQuery.data]);

  const effectiveExchangeRates = useMemo<QuotationExchangeRateFormState[]>(() => {
    const validRates = exchangeRates.filter((x) => x.currency && x.exchangeRate > 0);
    if (validRates.length > 0) {
      return validRates;
    }

    const normalizedCurrency = currencyCode.trim().toUpperCase() || "TRY";
    const normalizedExchangeRate = numberValue(exchangeRate) > 0 ? numberValue(exchangeRate) : 1;

    return [
      {
        id: "auto-default",
        currency: normalizedCurrency,
        exchangeRate: normalizedExchangeRate,
        exchangeRateDate: offerDate,
        isOfficial: false,
        dovizTipi: Number(normalizedCurrency),
      },
    ];
  }, [currencyCode, exchangeRate, exchangeRates, offerDate]);

  const createMutation = useMutation({
    mutationFn: async (payload: TempQuotattionCreateDto) => {
      const created = await tempQuickQuotationRepository.create(payload);
      const headerId = created.id;

      if (lines.length > 0) {
        const createLinesPayload = lines.map((line) => mapFormLineToCreateDto(line, headerId));
        await tempQuickQuotationRepository.createLines(createLinesPayload);
      }

      for (const rate of effectiveExchangeRates) {
        if (!rate.currency || !rate.exchangeRate) continue;
        await tempQuickQuotationRepository.createExchangeLine(
          mapRateToCreateDto(rate, headerId, offerDate)
        );
      }

      return created;
    },
    onSuccess: () => {
      showSuccess("Hızlı teklif oluşturuldu");
      router.replace("/(tabs)/sales/quotations/quick/list");
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Hızlı teklif oluşturulamadı");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: TempQuotattionUpdateDto }) => {
      await tempQuickQuotationRepository.revise(id, payload);

      const existingLines = linesQuery.data ?? [];
      const existingLineIdSet = new Set(existingLines.map((x) => x.id));
      const currentDbLineIds = new Set(
        lines.map((x) => toDbLineId(x.id)).filter((x): x is number => x !== null)
      );

      const lineDeleteIds = [...existingLineIdSet].filter((idItem) => !currentDbLineIds.has(idItem));
      for (const deleteId of lineDeleteIds) {
        await tempQuickQuotationRepository.removeLine(deleteId);
      }

      for (const line of lines) {
        const dbId = toDbLineId(line.id);
        if (dbId !== null) {
          await tempQuickQuotationRepository.updateLine(dbId, mapFormLineToUpdateDto(line));
        }
      }

      const newLines = lines.filter((x) => toDbLineId(x.id) === null);
      if (newLines.length > 0) {
        await tempQuickQuotationRepository.createLines(
          newLines.map((line) => mapFormLineToCreateDto(line, id))
        );
      }

      const existingExchangeLines = exchangeLinesQuery.data ?? [];
      const existingExchangeIdSet = new Set(existingExchangeLines.map((x) => x.id));
      const currentDbExchangeIds = new Set(
        effectiveExchangeRates.map((x) => toDbExchangeId(x.id)).filter((x): x is number => x !== null)
      );

      const exchangeDeleteIds = [...existingExchangeIdSet].filter((idItem) => !currentDbExchangeIds.has(idItem));
      for (const deleteId of exchangeDeleteIds) {
        await tempQuickQuotationRepository.removeExchangeLine(deleteId);
      }

      for (const rate of effectiveExchangeRates) {
        const dbId = toDbExchangeId(rate.id);
        if (dbId !== null) {
          await tempQuickQuotationRepository.updateExchangeLine(dbId, mapRateToUpdateDto(rate, offerDate));
        }
      }

      const newRates = effectiveExchangeRates.filter((x) => toDbExchangeId(x.id) === null);
      for (const rate of newRates) {
        if (!rate.currency || !rate.exchangeRate) continue;
        await tempQuickQuotationRepository.createExchangeLine(
          mapRateToCreateDto(rate, id, offerDate)
        );
      }

      return true;
    },
    onSuccess: () => {
      showSuccess("Hızlı teklif revize edildi");
      router.replace("/(tabs)/sales/quotations/quick/list");
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Hızlı teklif revize edilemedi");
    },
  });

  const handleSaveLine = useCallback(
    (savedLine: QuotationLineFormState) => {
      if (editingLine) {
        setLines((prev) => prev.map((line) => (line.id === editingLine.id ? savedLine : line)));
      } else {
        const toAdd = savedLine.relatedLines?.length
          ? [savedLine, ...savedLine.relatedLines]
          : [savedLine];
        setLines((prev) => [...prev, ...toAdd]);
      }
      setEditingLine(null);
      setLineFormVisible(false);
    },
    [editingLine]
  );

  const handleDeleteLine = useCallback((lineId: string) => {
    setLines((prev) => {
      const lineToDelete = prev.find((line) => line.id === lineId);
      if (lineToDelete?.relatedProductKey) {
        return prev.filter(
          (line) => line.id !== lineId && line.relatedProductKey !== lineToDelete.relatedProductKey
        );
      }
      return prev.filter((line) => line.id !== lineId);
    });
  }, []);

  const submit = (): void => {
    const resolvedExchangeRate =
      effectiveExchangeRates.find((x) => x.currency === currencyCode)?.exchangeRate ||
      effectiveExchangeRates[0]?.exchangeRate ||
      numberValue(exchangeRate);

    const payload: TempQuotattionCreateDto = {
      customerId: hasPreselectedCustomer ? (preselectedCustomerId as number) : numberValue(customerId),
      currencyCode: currencyCode.trim().toUpperCase() || "TRY",
      exchangeRate: resolvedExchangeRate,
      discountRate1: 0,
      discountRate2: 0,
      discountRate3: 0,
      description: description.trim(),
    };

    if (!payload.customerId) {
      showError("CustomerId zorunlu");
      return;
    }

    if (lines.length === 0) {
      showError("En az 1 stok satırı eklemelisin");
      return;
    }

    if (isEdit && editId) {
      updateMutation.mutate({ id: editId, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const loading = detailQuery.isLoading || linesQuery.isLoading || exchangeLinesQuery.isLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScreenHeader
        title={isEdit ? "Hızlı Teklif Revize Et" : "Hızlı Teklif Oluştur"}
        showBackButton
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#db2777" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 16) + 140 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {hasPreselectedCustomer ? (
            <View style={[styles.customerInfoCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
              <Text style={[styles.customerInfoTitle, { color: colors.text }]}>Cari Bilgisi</Text>
              <Text style={[styles.customerInfoLine, { color: colors.textSecondary }]}>
                ID: {preselectedCustomerId}
              </Text>
              <Text style={[styles.customerInfoLine, { color: colors.textSecondary }]}>
                Ad: {preselectedCustomerName || "-"}
              </Text>
              <Text style={[styles.customerInfoLine, { color: colors.textSecondary }]}>
                Kod: {preselectedCustomerCode || "-"}
              </Text>
            </View>
          ) : (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Customer ID</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.cardBorder, color: colors.text }]}
                value={customerId}
                onChangeText={setCustomerId}
                placeholder="Örn: 12"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Para Birimi</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerButton, { borderColor: colors.cardBorder }]}
              onPress={() => setCurrencyModalVisible(true)}
            >
              <Text style={[styles.pickerText, { color: colors.text }]}>
                {currencyOptions.find((c) => c.code === currencyCode)?.dovizIsmi ?? currencyCode}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea, { borderColor: colors.cardBorder, color: colors.text }]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Stok Satırları</Text>
            <TouchableOpacity
              style={[styles.sectionButton, { backgroundColor: "#0ea5e9" }]}
              onPress={() => {
                setEditingLine(null);
                setLineFormVisible(true);
              }}
            >
              <Text style={styles.sectionButtonText}>Stok Ekle</Text>
            </TouchableOpacity>
          </View>

          {lines.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz stok satırı yok</Text>
          ) : (
            <View style={styles.listGroup}>
              {lines.map((line) => (
                <View key={line.id} style={[styles.lineCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}> 
                  <Text style={[styles.lineTitle, { color: colors.text }]}>{line.productCode} - {line.productName}</Text>
                  <Text style={[styles.lineText, { color: colors.textSecondary }]}>Miktar: {line.quantity}</Text>
                  <Text style={[styles.lineText, { color: colors.textSecondary }]}>Birim Fiyat: {line.unitPrice}</Text>
                  <Text style={[styles.lineText, { color: colors.textSecondary }]}>Kur: {exchangeRate}</Text>
                  <Text style={[styles.lineText, { color: colors.textSecondary }]}>İskonto 1: %{line.discountRate1 ?? 0}</Text>
                  <Text style={[styles.lineText, { color: colors.textSecondary }]}>İskonto 2: %{line.discountRate2 ?? 0}</Text>
                  <Text style={[styles.lineText, { color: colors.textSecondary }]}>İskonto 3: %{line.discountRate3 ?? 0}</Text>
                  <View style={styles.lineActions}>
                    <TouchableOpacity
                      style={[styles.smallButton, { backgroundColor: "#0284c7" }]}
                      onPress={() => {
                        setEditingLine(line);
                        setLineFormVisible(true);
                      }}
                    >
                      <Text style={styles.smallButtonText}>Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallButton, { backgroundColor: "#dc2626" }]}
                      onPress={() =>
                        Alert.alert("Sil", "Bu stok satırını silmek istiyor musun?", [
                          { text: "Vazgeç", style: "cancel" },
                          { text: "Sil", style: "destructive", onPress: () => handleDeleteLine(line.id) },
                        ])
                      }
                    >
                      <Text style={styles.smallButtonText}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Kur Satırları</Text>
            <TouchableOpacity
              style={[styles.sectionButton, { backgroundColor: "#16a34a" }]}
              onPress={() => setExchangeDialogVisible(true)}
            >
              <Text style={styles.sectionButtonText}>Kur Yönet</Text>
            </TouchableOpacity>
          </View>

          {exchangeRates.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Kur satırı yok</Text>
          ) : (
            <View style={styles.listGroup}>
              {exchangeRates.map((rate) => (
                <View key={rate.id} style={[styles.lineCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}> 
                  <Text style={[styles.lineTitle, { color: colors.text }]}>{rate.currency}</Text>
                  <Text style={[styles.lineText, { color: colors.textSecondary }]}>Kur: {rate.exchangeRate}</Text>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      )}

      {!loading ? (
        <View
          style={[
            styles.footer,
            {
              borderTopColor: colors.cardBorder,
              backgroundColor: colors.background,
              paddingBottom: Math.max(insets.bottom, 10) + 64,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: pending ? "#9ca3af" : "#db2777" }]}
            onPress={submit}
            disabled={pending}
          >
            <Text style={styles.submitButtonText}>{isEdit ? "Revize Kaydet" : "Hızlı Teklif Oluştur"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <QuotationLineForm
        visible={lineFormVisible}
        line={editingLine}
        onClose={() => {
          setEditingLine(null);
          setLineFormVisible(false);
        }}
        onSave={handleSaveLine}
        currency={currencyCode}
        currencyOptions={(currencyOptions ?? []).map((x) => ({
          code: x.code,
          dovizTipi: x.dovizTipi,
          dovizIsmi: x.dovizIsmi ?? "",
        }))}
        exchangeRates={erpExchangeRates.map((x) => ({ dovizTipi: x.dovizTipi, kurDegeri: x.kurDegeri }))}
      />

      <ExchangeRateDialog
        visible={exchangeDialogVisible}
        exchangeRates={exchangeRates}
        currencyOptions={currencyOptions ?? []}
        erpExchangeRates={erpExchangeRates}
        isLoadingErpRates={isLoadingErpRates}
        currencyInUse={currencyCode}
        onClose={() => setExchangeDialogVisible(false)}
        onSave={(rates) => {
          setExchangeRates(rates);
          setExchangeDialogVisible(false);
        }}
        offerDate={offerDate}
      />

      <PickerModal
        visible={currencyModalVisible}
        options={(currencyOptions ?? []).map((c) => ({
          id: c.code,
          name: c.dovizIsmi ?? c.code,
          code: c.code,
        }))}
        selectedValue={currencyCode}
        onSelect={(option) => {
          setCurrencyCode(String(option.id).toUpperCase());
          setCurrencyModalVisible(false);
        }}
        onClose={() => setCurrencyModalVisible(false)}
        title="Para Birimi Seçiniz"
        searchPlaceholder="Para birimi ara..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    gap: 10,
  },
  field: {
    gap: 6,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 8,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  pickerButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  pickerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  customerInfoCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  customerInfoTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  customerInfoLine: {
    fontSize: 12,
    fontWeight: "500",
  },
  sectionHeaderRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
  },
  listGroup: {
    gap: 8,
  },
  lineCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  lineTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  lineText: {
    fontSize: 12,
  },
  lineActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  smallButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
