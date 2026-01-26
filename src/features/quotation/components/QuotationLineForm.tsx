import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { ProductPicker } from "./ProductPicker";
import { quotationApi } from "../api";
import { useStock } from "../../stocks/hooks";
import type {
  QuotationLineFormState,
  PricingRuleLineGetDto,
  UserDiscountLimitDto,
  PriceOfProductDto,
  StockGetDto,
} from "../types";
import { calculateLineTotals } from "../utils";

interface QuotationLineFormProps {
  visible: boolean;
  line: QuotationLineFormState | null;
  onClose: () => void;
  onSave: (line: QuotationLineFormState) => void;
  currency: string;
  currencyOptions?: Array<{ code: string; dovizTipi: number; dovizIsmi: string }>;
  pricingRules?: PricingRuleLineGetDto[];
  userDiscountLimits?: UserDiscountLimitDto[];
  exchangeRates?: Array<{ dovizTipi: number; kurDegeri: number }>;
}

export function QuotationLineForm({
  visible,
  line,
  onClose,
  onSave,
  currency,
  currencyOptions,
  pricingRules,
  userDiscountLimits,
  exchangeRates,
}: QuotationLineFormProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();

  const [selectedStock, setSelectedStock] = useState<StockGetDto | undefined>();
  const [quantity, setQuantity] = useState<string>("1");
  const [unitPrice, setUnitPrice] = useState<string>("0");
  const [discountRate1, setDiscountRate1] = useState<string>("0");
  const [discountRate2, setDiscountRate2] = useState<string>("0");
  const [discountRate3, setDiscountRate3] = useState<string>("0");
  const [vatRate, setVatRate] = useState<string>("18");
  const [description, setDescription] = useState<string>("");
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<number>(0);
  const [approvalMessage, setApprovalMessage] = useState<string>("");

  const currentLine: QuotationLineFormState = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    const disc1 = parseFloat(discountRate1) || 0;
    const disc2 = parseFloat(discountRate2) || 0;
    const disc3 = parseFloat(discountRate3) || 0;
    const vat = parseFloat(vatRate) || 0;

    const baseLine: QuotationLineFormState = {
      id: line?.id || `temp-${Date.now()}`,
      productId: selectedStock?.id || null,
      productCode: selectedStock?.erpStockCode || "",
      productName: selectedStock?.stockName || "",
      groupCode: selectedStock?.grupKodu || null,
      quantity: qty,
      unitPrice: price,
      discountRate1: disc1,
      discountAmount1: 0,
      discountRate2: disc2,
      discountAmount2: 0,
      discountRate3: disc3,
      discountAmount3: 0,
      vatRate: vat,
      vatAmount: 0,
      lineTotal: 0,
      lineGrandTotal: 0,
      description: description || null,
      isEditing: false,
      approvalStatus,
    };

    return calculateLineTotals(baseLine);
  }, [
    line?.id,
    selectedStock,
    quantity,
    unitPrice,
    discountRate1,
    discountRate2,
    discountRate3,
    vatRate,
    description,
    approvalStatus,
  ]);

  useEffect(() => {
    if (line && visible) {
      setQuantity(String(line.quantity));
      setUnitPrice(String(line.unitPrice));
      setDiscountRate1(String(line.discountRate1));
      setDiscountRate2(String(line.discountRate2));
      setDiscountRate3(String(line.discountRate3));
      setVatRate(String(line.vatRate));
      setDescription(line.description || "");
      setApprovalStatus(line.approvalStatus || 0);
    } else if (!visible) {
      resetForm();
    }
  }, [line, visible]);

  const resetForm = useCallback(() => {
    setSelectedStock(undefined);
    setQuantity("1");
    setUnitPrice("0");
    setDiscountRate1("0");
    setDiscountRate2("0");
    setDiscountRate3("0");
    setVatRate("18");
    setDescription("");
    setApprovalStatus(0);
    setApprovalMessage("");
  }, []);

  const { data: stockData } = useStock(selectedStock?.id);

  const handleStockSelect = useCallback(
    async (stock: StockGetDto | undefined) => {
      setSelectedStock(stock);
      if (!stock) {
        setUnitPrice("0");
        return;
      }

      setIsLoadingPrice(true);
      try {
        const priceData = await quotationApi.getPriceOfProduct([
          {
            productCode: stock.erpStockCode,
            groupCode: stock.grupKodu || "",
          },
        ]);

        if (priceData && priceData.length > 0) {
          const price = priceData[0];
          let finalPrice = price.listPrice;

          if (price.currency !== currency && exchangeRates && currencyOptions) {
            const priceCurrency = currencyOptions.find((c) => c.code === price.currency);
            const targetCurrency = currencyOptions.find((c) => c.code === currency);

            if (priceCurrency && targetCurrency && exchangeRates) {
              const priceRate = exchangeRates.find(
                (r) => r.dovizTipi === priceCurrency.dovizTipi
              )?.kurDegeri;
              const targetRate = exchangeRates.find(
                (r) => r.dovizTipi === targetCurrency.dovizTipi
              )?.kurDegeri;

              if (priceRate && targetRate && priceRate > 0 && targetRate > 0) {
                finalPrice = (price.listPrice * priceRate) / targetRate;
              }
            }
          }

          setUnitPrice(String(finalPrice));

          if (price.discount1 !== null && price.discount1 !== undefined)
            setDiscountRate1(String(price.discount1));
          if (price.discount2 !== null && price.discount2 !== undefined)
            setDiscountRate2(String(price.discount2));
          if (price.discount3 !== null && price.discount3 !== undefined)
            setDiscountRate3(String(price.discount3));
        }

        if (pricingRules && stock.erpStockCode) {
          const qty = parseFloat(quantity) || 1;
          const matchingRule = pricingRules.find(
            (rule) =>
              rule.stokCode === stock.erpStockCode &&
              qty >= rule.minQuantity &&
              (!rule.maxQuantity || qty <= rule.maxQuantity)
          );

          if (matchingRule) {
            if (matchingRule.fixedUnitPrice !== null && matchingRule.fixedUnitPrice !== undefined) {
              setUnitPrice(String(matchingRule.fixedUnitPrice));
            }
            setDiscountRate1(String(matchingRule.discountRate1));
            setDiscountRate2(String(matchingRule.discountRate2));
            setDiscountRate3(String(matchingRule.discountRate3));
          }
        }
      } catch (error) {
        console.error("Price fetch error:", error);
      } finally {
        setIsLoadingPrice(false);
      }
    },
    [currency, exchangeRates, currencyOptions, pricingRules, quantity]
  );

  useEffect(() => {
    if (selectedStock && pricingRules && selectedStock.erpStockCode) {
      const qty = parseFloat(quantity) || 1;
      const matchingRule = pricingRules.find(
        (rule) =>
          rule.stokCode === selectedStock.erpStockCode &&
          qty >= rule.minQuantity &&
          (!rule.maxQuantity || qty <= rule.maxQuantity)
      );

      if (matchingRule) {
        if (matchingRule.fixedUnitPrice !== null && matchingRule.fixedUnitPrice !== undefined) {
          setUnitPrice(String(matchingRule.fixedUnitPrice));
        }
        setDiscountRate1(String(matchingRule.discountRate1));
        setDiscountRate2(String(matchingRule.discountRate2));
        setDiscountRate3(String(matchingRule.discountRate3));
      }
    }
  }, [selectedStock, pricingRules, quantity]);

  useEffect(() => {
    if (stockData && stockData.parentRelations && stockData.parentRelations.length > 0) {
      const relatedStocksInfo = stockData.parentRelations
        .map((r) => `${r.relatedStockName || r.relatedStockCode} (${r.quantity})`)
        .join(", ");
      if (relatedStocksInfo && !description.includes("İlgili Stoklar")) {
        setDescription(
          (prev) => (prev ? `${prev}\n` : "") + `İlgili Stoklar: ${relatedStocksInfo}`
        );
      }
    }
  }, [stockData]);

  useEffect(() => {
    if (selectedStock && userDiscountLimits && selectedStock.grupKodu) {
      const matchingLimit = userDiscountLimits.find(
        (limit) => limit.erpProductGroupCode === selectedStock.grupKodu
      );

      if (matchingLimit) {
        const disc1 = parseFloat(discountRate1) || 0;
        const disc2 = parseFloat(discountRate2) || 0;
        const disc3 = parseFloat(discountRate3) || 0;

        const exceedsLimit1 = disc1 > matchingLimit.maxDiscount1;
        const exceedsLimit2 =
          matchingLimit.maxDiscount2 !== null &&
          matchingLimit.maxDiscount2 !== undefined &&
          disc2 > matchingLimit.maxDiscount2;
        const exceedsLimit3 =
          matchingLimit.maxDiscount3 !== null &&
          matchingLimit.maxDiscount3 !== undefined &&
          disc3 > matchingLimit.maxDiscount3;

        if (exceedsLimit1 || exceedsLimit2 || exceedsLimit3) {
          setApprovalStatus(1);
          setApprovalMessage(
            `İndirim limiti aşıldı. Maksimum: %${matchingLimit.maxDiscount1} / %${matchingLimit.maxDiscount2 || "-"} / %${matchingLimit.maxDiscount3 || "-"}`
          );
        } else {
          setApprovalStatus(0);
          setApprovalMessage("");
        }
      }
    }
  }, [selectedStock, userDiscountLimits, discountRate1, discountRate2, discountRate3]);

  const handleSave = useCallback(() => {
    if (!selectedStock) {
      return;
    }

    onSave(currentLine);
    resetForm();
    onClose();
  }, [selectedStock, currentLine, onSave, onClose, resetForm]);

  const handleCancel = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={handleCancel} />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {line ? "Satır Düzenle" : "Yeni Satır"}
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <ProductPicker
              value={selectedStock?.erpStockCode}
              productName={selectedStock?.stockName}
              onChange={handleStockSelect}
              label="Ürün"
              required
            />

            {isLoadingPrice && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Fiyat bilgisi yükleniyor...
                </Text>
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Miktar <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text },
                ]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Miktar"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Birim Fiyat <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text },
                ]}
                value={unitPrice}
                onChangeText={setUnitPrice}
                placeholder="Birim fiyat"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>İndirim 1 (%)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text },
                ]}
                value={discountRate1}
                onChangeText={setDiscountRate1}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>İndirim 2 (%)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text },
                ]}
                value={discountRate2}
                onChangeText={setDiscountRate2}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>İndirim 3 (%)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text },
                ]}
                value={discountRate3}
                onChangeText={setDiscountRate3}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>KDV Oranı (%)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text },
                ]}
                value={vatRate}
                onChangeText={setVatRate}
                placeholder="18"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Açıklama</Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.text },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Satır açıklaması"
                multiline
                numberOfLines={3}
              />
            </View>

            {approvalStatus === 1 && approvalMessage && (
              <View style={[styles.approvalWarning, { backgroundColor: colors.warning + "20" }]}>
                <Text style={[styles.approvalWarningText, { color: colors.warning }]}>
                  ⚠️ {approvalMessage}
                </Text>
              </View>
            )}

            <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Hesaplama Özeti</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Ara Toplam:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {currentLine.lineTotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>KDV:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {currentLine.vatAmount.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>Genel Toplam:</Text>
                <Text style={[styles.summaryValue, { color: colors.accent, fontWeight: "600" }]}>
                  {currentLine.lineGrandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.accent },
                !selectedStock && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!selectedStock}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  handle: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "300",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  approvalWarning: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  approvalWarningText: {
    fontSize: 13,
    lineHeight: 18,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryRowTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
