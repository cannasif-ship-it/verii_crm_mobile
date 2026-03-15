import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as Sharing from "expo-sharing";
import { WebView } from "react-native-webview";
import {
  Calendar03Icon,
  Coins01Icon,
  File01Icon,
  Note01Icon,
  Tick02Icon,
  UserIcon,
  Edit02Icon,
} from "hugeicons-react-native";

import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useToast } from "../../../hooks/useToast";
import { tempQuickQuotationRepository } from "../repositories/tempQuotattion.repository";
import { createBuiltInTempQuickQuotationReportPdf } from "../utils/createBuiltInTempQuickQuotationReportPdf";
import type { QuotationLineFormState } from "../../quotation/types";

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

function mapTempLineToFormState(id: number, line: {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountRate1: number;
  discountAmount1: number;
  discountRate2: number;
  discountAmount2: number;
  discountRate3: number;
  discountAmount3: number;
  vatRate: number;
  vatAmount: number;
  lineTotal: number;
  lineGrandTotal: number;
  description: string;
}): QuotationLineFormState {
  return {
    id: `db-${id}`,
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
  };
}

export function TempQuickQuotationDetailScreen(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();
  const { themeMode } = useUIStore();
  const params = useLocalSearchParams<{ id?: string }>();
  const quickQuotationId = params.id ? Number(params.id) : undefined;

  const isDark = themeMode === "dark";
  const mainBg = isDark ? "#0c0516" : "#FAFAFA";
  const brandColor = isDark ? "#EC4899" : "#DB2777";
  const cardBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.85)";
  const inputBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(236, 72, 153, 0.25)";
  const textColor = isDark ? "#F8FAFC" : "#1E293B";
  const mutedColor = isDark ? "#94A3B8" : "#64748B";

  const gradientColors = (
    isDark
      ? ["rgba(236, 72, 153, 0.1)", "transparent", "rgba(249, 115, 22, 0.08)"]
      : ["rgba(255, 235, 240, 0.6)", "#FFFFFF", "rgba(255, 240, 225, 0.6)"]
  ) as [string, string, ...string[]];

  const [pdfFileUri, setPdfFileUri] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfViewerHeight = useMemo(() => Math.max(420, windowHeight * 0.55), [windowHeight]);

  const detailQuery = useQuery({
    queryKey: ["temp-quick-quotation", "detail", quickQuotationId],
    queryFn: () => tempQuickQuotationRepository.getById(quickQuotationId as number),
    enabled: quickQuotationId != null,
  });

  const linesQuery = useQuery({
    queryKey: ["temp-quick-quotation", "lines", quickQuotationId],
    queryFn: () => tempQuickQuotationRepository.getLinesByHeaderId(quickQuotationId as number),
    enabled: quickQuotationId != null,
  });

  const exchangeLinesQuery = useQuery({
    queryKey: ["temp-quick-quotation", "exchange-lines", quickQuotationId],
    queryFn: () => tempQuickQuotationRepository.getExchangeLinesByHeaderId(quickQuotationId as number),
    enabled: quickQuotationId != null,
  });

  const convertMutation = useMutation({
    mutationFn: (id: number) => tempQuickQuotationRepository.approveAndConvertToQuotation(id),
    onSuccess: () => {
      showSuccess("Teklife dönüştürme akışına alındı");
      queryClient.invalidateQueries({ queryKey: ["temp-quick-quotation", "list"] });
      queryClient.invalidateQueries({ queryKey: ["temp-quick-quotation", "detail", quickQuotationId] });
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Teklife dönüştürme başarısız");
    },
  });

  const loading = detailQuery.isLoading || linesQuery.isLoading || exchangeLinesQuery.isLoading;
  const detail = detailQuery.data;
  const mappedLines = useMemo(
    () =>
      (linesQuery.data ?? []).map((line) =>
        mapTempLineToFormState(line.id, line)
      ),
    [linesQuery.data]
  );

  const handleGeneratePdf = useCallback(async () => {
    if (!detail || mappedLines.length === 0) {
      showError("PDF oluşturmak için hızlı teklif kalemleri bulunamadı");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const fileUri = await createBuiltInTempQuickQuotationReportPdf({
        tempQuotationId: detail.id,
        customerName: detail.customerName,
        currencyCode: detail.currencyCode,
        lines: mappedLines,
        offerDate: detail.offerDate,
        description: detail.description,
      });
      setPdfFileUri(fileUri);
      showSuccess("PDF oluşturuldu");
    } catch (error) {
      showError(error instanceof Error ? error.message : "PDF oluşturulamadı");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [detail, mappedLines, showError, showSuccess]);

  const handleSharePdf = useCallback(async () => {
    if (!pdfFileUri) return;
    try {
      const shareUri = pdfFileUri.startsWith("file://") ? pdfFileUri : `file://${pdfFileUri}`;
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showError("Paylaşım bu cihazda kullanılamıyor");
        return;
      }
      await Sharing.shareAsync(shareUri, {
        mimeType: "application/pdf",
        dialogTitle: "Hızlı Teklif PDF Paylaş",
      });
    } catch (error) {
      showError(error instanceof Error ? error.message : "PDF paylaşılamadı");
    }
  }, [pdfFileUri, showError]);

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      </View>

      <ScreenHeader title="Hızlı Teklif Detayı" showBackButton />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={brandColor} />
        </View>
      ) : !detail ? (
        <View style={styles.center}>
          <Text style={{ color: textColor }}>Kayıt bulunamadı.</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.card, { borderColor, backgroundColor: cardBg }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: textColor }]}>#{detail.id}</Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: detail.isApproved ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                      borderColor: detail.isApproved ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)",
                    },
                  ]}
                >
                  <Text style={{ color: detail.isApproved ? "#10B981" : "#F59E0B", fontWeight: "700", fontSize: 12 }}>
                    {detail.isApproved ? "Onaylandı" : "Taslak"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <UserIcon size={16} color={mutedColor} variant="stroke" />
                <Text style={[styles.infoText, { color: textColor }]}>{detail.customerName || `Cari ID: ${detail.customerId}`}</Text>
              </View>
              <View style={styles.infoRow}>
                <Coins01Icon size={16} color={mutedColor} variant="stroke" />
                <Text style={[styles.infoText, { color: textColor }]}>Para Birimi: {detail.currencyCode}</Text>
              </View>
              <View style={styles.infoRow}>
                <Calendar03Icon size={16} color={mutedColor} variant="stroke" />
                <Text style={[styles.infoText, { color: textColor }]}>Teklif Tarihi: {formatDate(detail.offerDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Note01Icon size={16} color={mutedColor} variant="stroke" />
                <Text style={[styles.infoText, { color: textColor }]}>{detail.description || "-"}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "rgba(14, 165, 233, 0.12)", borderColor: "rgba(14, 165, 233, 0.3)" }]}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/sales/quotations/quick/create",
                    params: { id: String(detail.id) },
                  })
                }
              >
                <Edit02Icon size={16} color="#0ea5e9" variant="stroke" />
                <Text style={[styles.actionBtnText, { color: "#0ea5e9" }]}>Revize Et</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: detail.isApproved ? mutedColor : "rgba(16, 185, 129, 0.12)",
                    borderColor: detail.isApproved ? mutedColor : "rgba(16, 185, 129, 0.3)",
                    opacity: convertMutation.isPending || detail.isApproved ? 0.6 : 1,
                  },
                ]}
                disabled={convertMutation.isPending || detail.isApproved}
                onPress={() => convertMutation.mutate(detail.id)}
              >
                {convertMutation.isPending ? (
                  <ActivityIndicator size="small" color="#16a34a" />
                ) : (
                  <>
                    <Tick02Icon size={16} color="#16a34a" variant="stroke" />
                    <Text style={[styles.actionBtnText, { color: "#16a34a" }]}>
                      {detail.isApproved ? "Dönüştürüldü" : "Teklife Dön"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Stok Kalemleri</Text>
            </View>

            {(linesQuery.data ?? []).map((line) => (
              <View key={line.id} style={[styles.card, { borderColor, backgroundColor: cardBg }]}>
                <Text style={[styles.lineTitle, { color: textColor }]}>{line.productCode} - {line.productName}</Text>
                <View style={styles.lineGrid}>
                  <Text style={[styles.lineText, { color: mutedColor }]}>Miktar: <Text style={{ color: textColor }}>{line.quantity}</Text></Text>
                  <Text style={[styles.lineText, { color: mutedColor }]}>Fiyat: <Text style={{ color: textColor }}>{line.unitPrice}</Text></Text>
                  <Text style={[styles.lineText, { color: mutedColor }]}>İsk.1: <Text style={{ color: textColor }}>%{line.discountRate1 ?? 0}</Text></Text>
                  <Text style={[styles.lineText, { color: mutedColor }]}>KDV: <Text style={{ color: textColor }}>%{line.vatRate ?? 0}</Text></Text>
                </View>
                {!!line.description && (
                  <Text style={[styles.lineDescription, { color: mutedColor }]}>{line.description}</Text>
                )}
              </View>
            ))}

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Kur Satırları</Text>
            </View>
            {(exchangeLinesQuery.data ?? []).map((rate) => (
              <View key={rate.id} style={[styles.exchangeCard, { borderColor, backgroundColor: cardBg }]}>
                <Text style={[styles.infoText, { color: textColor }]}>{rate.currency}</Text>
                <Text style={[styles.exchangeValue, { color: brandColor }]}>{rate.exchangeRate}</Text>
              </View>
            ))}

            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderLeft}>
                <File01Icon size={18} color={brandColor} variant="stroke" />
                <Text style={[styles.sectionTitle, { color: textColor }]}>PDF Çıktısı</Text>
              </View>
            </View>

            <View style={[styles.card, { borderColor, backgroundColor: cardBg }]}>
              <Text style={[styles.label, { color: mutedColor, marginLeft: 0 }]}>Rapor Şablonu</Text>
              <View style={[styles.reportTemplateBox, { borderColor, backgroundColor: inputBg }]}>
                <Text style={[styles.reportTemplateText, { color: textColor }]}>Windo Teklif Yap</Text>
              </View>

              <TouchableOpacity
                style={[styles.reportPrimaryButton, { backgroundColor: isGeneratingPdf ? mutedColor : brandColor }]}
                onPress={() => void handleGeneratePdf()}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.reportPrimaryButtonText}>PDF Oluştur</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.reportSecondaryButton, { backgroundColor: pdfFileUri ? "#60A5FA" : mutedColor, opacity: pdfFileUri ? 1 : 0.6 }]}
                onPress={() => void handleSharePdf()}
                disabled={!pdfFileUri}
              >
                <Text style={styles.reportSecondaryButtonText}>Paylaş</Text>
              </TouchableOpacity>

              {pdfFileUri ? (
                <View style={[styles.previewSection, { borderColor, backgroundColor: inputBg }]}>
                  <Text style={[styles.previewTitle, { color: textColor }]}>PDF Önizleme</Text>
                  <View style={[styles.pdfViewerWrapper, { height: pdfViewerHeight }]}>
                    <WebView
                      source={{ uri: pdfFileUri }}
                      originWhitelist={["file://", "content://"]}
                      style={styles.pdfWebView}
                      scalesPageToFit
                      nestedScrollEnabled
                    />
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  lineTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  lineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  lineText: {
    fontSize: 13,
    minWidth: "45%",
  },
  lineDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  exchangeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  exchangeValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reportTemplateBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reportTemplateText: {
    fontSize: 15,
    fontWeight: "600",
  },
  reportPrimaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reportPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  reportSecondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reportSecondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  previewSection: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  pdfViewerWrapper: {
    borderRadius: 10,
    overflow: "hidden",
  },
  pdfWebView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
