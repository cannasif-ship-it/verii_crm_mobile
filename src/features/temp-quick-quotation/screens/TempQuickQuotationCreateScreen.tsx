import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useToast } from "../../../hooks/useToast";
import { tempQuickQuotationRepository } from "../repositories/tempQuotattion.repository";
import type { TempQuotattionCreateDto, TempQuotattionUpdateDto } from "../models/tempQuotattion.model";

function numberValue(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function TempQuickQuotationCreateScreen(): React.ReactElement {
  const router = useRouter();
  const { colors } = useUIStore();
  const { showError, showSuccess } = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const editId = params.id ? Number(params.id) : undefined;
  const isEdit = !!editId;

  const [customerId, setCustomerId] = useState("");
  const [currencyCode, setCurrencyCode] = useState("TRY");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [discountRate1, setDiscountRate1] = useState("0");
  const [discountRate2, setDiscountRate2] = useState("0");
  const [discountRate3, setDiscountRate3] = useState("0");
  const [description, setDescription] = useState("");

  const detailQuery = useQuery({
    queryKey: ["temp-quick-quotation", "detail", editId],
    queryFn: () => tempQuickQuotationRepository.getById(editId as number),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!detailQuery.data) return;

    setCustomerId(String(detailQuery.data.customerId ?? ""));
    setCurrencyCode(detailQuery.data.currencyCode || "TRY");
    setExchangeRate(String(detailQuery.data.exchangeRate ?? 1));
    setDiscountRate1(String(detailQuery.data.discountRate1 ?? 0));
    setDiscountRate2(String(detailQuery.data.discountRate2 ?? 0));
    setDiscountRate3(String(detailQuery.data.discountRate3 ?? 0));
    setDescription(detailQuery.data.description || "");
  }, [detailQuery.data]);

  const createMutation = useMutation({
    mutationFn: (payload: TempQuotattionCreateDto) => tempQuickQuotationRepository.create(payload),
    onSuccess: () => {
      showSuccess("Hızlı teklif oluşturuldu");
      router.replace("/(tabs)/sales/quotations/quick/list");
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Hızlı teklif oluşturulamadı");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TempQuotattionUpdateDto }) =>
      tempQuickQuotationRepository.revise(id, payload),
    onSuccess: () => {
      showSuccess("Hızlı teklif revize edildi");
      router.replace("/(tabs)/sales/quotations/quick/list");
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Hızlı teklif revize edilemedi");
    },
  });

  const submit = (): void => {
    const payload: TempQuotattionCreateDto = {
      customerId: numberValue(customerId),
      currencyCode: currencyCode.trim().toUpperCase() || "TRY",
      exchangeRate: numberValue(exchangeRate),
      discountRate1: numberValue(discountRate1),
      discountRate2: numberValue(discountRate2),
      discountRate3: numberValue(discountRate3),
      description: description.trim(),
    };

    if (!payload.customerId) {
      showError("CustomerId zorunlu");
      return;
    }

    if (isEdit && editId) {
      updateMutation.mutate({ id: editId, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScreenHeader
        title={isEdit ? "Hızlı Teklif Revize Et" : "Hızlı Teklif Oluştur"}
        showBackButton
      />

      {detailQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#db2777" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Para Birimi</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.cardBorder, color: colors.text }]}
              value={currencyCode}
              onChangeText={setCurrencyCode}
              placeholder="TRY"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Kur</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.cardBorder, color: colors.text }]}
              value={exchangeRate}
              onChangeText={setExchangeRate}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={[styles.label, { color: colors.text }]}>İskonto 1</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.cardBorder, color: colors.text }]}
                value={discountRate1}
                onChangeText={setDiscountRate1}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={[styles.label, { color: colors.text }]}>İskonto 2</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.cardBorder, color: colors.text }]}
                value={discountRate2}
                onChangeText={setDiscountRate2}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>İskonto 3</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.cardBorder, color: colors.text }]}
              value={discountRate3}
              onChangeText={setDiscountRate3}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />
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

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: pending ? "#9ca3af" : "#db2777" }]}
            onPress={submit}
            disabled={pending}
          >
            <Text style={styles.submitButtonText}>{isEdit ? "Revize Kaydet" : "Hızlı Teklif Oluştur"}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 8,
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
