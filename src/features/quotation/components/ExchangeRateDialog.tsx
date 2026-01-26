import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { QuotationExchangeRateFormState, CurrencyOptionDto, ExchangeRateDto } from "../types";

interface ExchangeRateDialogProps {
  visible: boolean;
  exchangeRates: QuotationExchangeRateFormState[];
  currencyOptions?: CurrencyOptionDto[];
  erpExchangeRates?: ExchangeRateDto[];
  onClose: () => void;
  onSave: (rates: QuotationExchangeRateFormState[]) => void;
  offerDate?: string;
}

export function ExchangeRateDialog({
  visible,
  exchangeRates: initialRates,
  currencyOptions,
  erpExchangeRates,
  onClose,
  onSave,
  offerDate,
}: ExchangeRateDialogProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();

  const [rates, setRates] = useState<QuotationExchangeRateFormState[]>([]);

  useEffect(() => {
    if (visible) {
      setRates(initialRates.length > 0 ? [...initialRates] : []);
    }
  }, [visible, initialRates]);

  const handleAddRate = useCallback(() => {
    const newRate: QuotationExchangeRateFormState = {
      id: `temp-${Date.now()}`,
      currency: "",
      exchangeRate: 0,
      exchangeRateDate: offerDate || new Date().toISOString().split("T")[0],
      isOfficial: true,
    };
    setRates((prev) => [...prev, newRate]);
  }, [offerDate]);

  const handleRemoveRate = useCallback((id: string) => {
    setRates((prev) => prev.filter((rate) => rate.id !== id));
  }, []);

  const handleRateChange = useCallback(
    (id: string, field: keyof QuotationExchangeRateFormState, value: string | number | boolean) => {
      setRates((prev) =>
        prev.map((rate) => (rate.id === id ? { ...rate, [field]: value } : rate))
      );
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave(rates);
    onClose();
  }, [rates, onSave, onClose]);

  const getCurrencyName = useCallback(
    (code: string) => {
      return currencyOptions?.find((c) => c.code === code)?.dovizIsmi || code;
    },
    [currencyOptions]
  );

  const getErpRate = useCallback(
    (currencyCode: string) => {
      if (!currencyCode || !currencyOptions || !erpExchangeRates) return undefined;

      const currency = currencyOptions.find((c) => c.code === currencyCode);
      if (!currency) return undefined;

      return erpExchangeRates.find((r) => r.dovizTipi === currency.dovizTipi)?.kurDegeri;
    },
    [currencyOptions, erpExchangeRates]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Döviz Kurları</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {rates.map((rate) => {
              const erpRate = getErpRate(rate.currency);

              return (
                <View
                  key={rate.id}
                  style={[
                    styles.rateCard,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.rateCardHeader}>
                    <Text style={[styles.rateCardTitle, { color: colors.text }]}>
                      {getCurrencyName(rate.currency) || "Para Birimi Seçiniz"}
                    </Text>
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: colors.error }]}
                      onPress={() => handleRemoveRate(rate.id)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Para Birimi</Text>
                    <View style={styles.currencyButtons}>
                      {currencyOptions?.map((option) => (
                        <TouchableOpacity
                          key={option.code}
                          style={[
                            styles.currencyButton,
                            {
                              backgroundColor:
                                rate.currency === option.code
                                  ? colors.accent
                                  : colors.backgroundSecondary,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => handleRateChange(rate.id, "currency", option.code)}
                        >
                          <Text
                            style={[
                              styles.currencyButtonText,
                              {
                                color: rate.currency === option.code ? "#FFFFFF" : colors.text,
                              },
                            ]}
                          >
                            {option.dovizIsmi}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {erpRate !== undefined && (
                    <View style={[styles.erpRateInfo, { backgroundColor: colors.accent + "15" }]}>
                      <Text style={[styles.erpRateText, { color: colors.accent }]}>
                        ERP Kur: {erpRate.toFixed(4)}
                      </Text>
                      <TouchableOpacity
                        style={[styles.useErpButton, { backgroundColor: colors.accent }]}
                        onPress={() => handleRateChange(rate.id, "exchangeRate", erpRate)}
                      >
                        <Text style={styles.useErpButtonText}>Kullan</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.fieldContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Kur</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      value={rate.exchangeRate ? String(rate.exchangeRate) : ""}
                      onChangeText={(text) =>
                        handleRateChange(rate.id, "exchangeRate", parseFloat(text) || 0)
                      }
                      placeholder="Kur değeri"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Tarih</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      value={rate.exchangeRateDate}
                      onChangeText={(text) => handleRateChange(rate.id, "exchangeRateDate", text)}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.accent }]}
              onPress={handleAddRate}
            >
              <Text style={styles.addButtonText}>+ Kur Ekle</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
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
  rateCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  rateCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rateCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  currencyButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  currencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  currencyButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  erpRateInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  erpRateText: {
    fontSize: 14,
    fontWeight: "500",
  },
  useErpButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  useErpButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
