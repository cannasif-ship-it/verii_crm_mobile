import React, { useCallback, useState, useMemo, useEffect, memo, useImperativeHandle, forwardRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import type { ThemeColors } from "../../../constants/theme";
import { useUIStore } from "../../../store/ui";
import { VoiceSearchButton } from "./VoiceSearchButton";
import { useStocks, useStock, useStockRelations, useStockRelationsAsRelated } from "../../stocks/hooks";
import type { StockGetDto, StockRelationDto, PagedFilter } from "../../stocks/types";

export interface ProductPickerRef {
  close: () => void;
}

export interface RelatedStocksSelectionProps {
  stock: StockGetDto & { parentRelations: StockRelationDto[] };
  onCancel: () => void;
  onApply: (selectedIds: number[]) => void;
}

interface ProductPickerProps {
  value?: string;
  productName?: string;
  onChange: (stock: StockGetDto | undefined) => void | boolean | Promise<void | boolean>;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  parentVisible?: boolean;
  relatedStocksSelection?: RelatedStocksSelectionProps | null;
}

function StockListItem({
  item,
  isSelected,
  colors,
  onSelect,
  onShowRelationDetail,
  modalOpen,
}: {
  item: StockGetDto;
  isSelected: boolean;
  colors: ThemeColors;
  onSelect: () => void;
  onShowRelationDetail: (stock: StockGetDto, relations: StockRelationDto[]) => void;
  modalOpen: boolean;
}): React.ReactElement {
  const { t } = useTranslation();
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";
  const brandColor = isDark ? "#EC4899" : "#DB2777";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#F8FAFC" : "#1E293B";
  const mutedColor = isDark ? "#94A3B8" : "#64748B";

  const { data: stockDetail } = useStock(modalOpen ? item.id : undefined);
  const { data: relationsData } = useStockRelations({
    stockId: modalOpen ? item.id : undefined,
  });
  const { data: relationsAsRelatedData } = useStockRelationsAsRelated(modalOpen ? item.id : undefined);
  const relationsList = useMemo((): StockRelationDto[] => {
    if (stockDetail?.parentRelations && stockDetail.parentRelations.length > 0) {
      return stockDetail.parentRelations;
    }
    const asParent = relationsData?.pages?.[0]?.items;
    if (Array.isArray(asParent) && asParent.length > 0) return asParent;
    const asRelated = relationsAsRelatedData?.items;
    return Array.isArray(asRelated) ? asRelated : [];
  }, [stockDetail?.parentRelations, relationsData?.pages, relationsAsRelatedData?.items]);

  const relationCount = relationsList.length;
  const showBadge = relationCount > 0;

  return (
    <View
      style={[
        styles.stockItem,
        { borderBottomColor: borderColor },
        isSelected && { backgroundColor: isDark ? "rgba(236, 72, 153, 0.1)" : "rgba(219, 39, 119, 0.08)" },
      ]}
    >
      <TouchableOpacity
        style={styles.stockItemTouchable}
        onPress={onSelect}
        activeOpacity={0.7}
      >
        <View style={styles.stockInfo}>
          <Text style={[styles.stockName, { color: textColor }]} numberOfLines={1}>
            {item.stockName}
          </Text>
          <Text style={[styles.stockCode, { color: mutedColor }]} numberOfLines={1}>
            {item.erpStockCode}
          </Text>
        </View>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: brandColor }]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
      {showBadge && (
        <TouchableOpacity
          style={[
            styles.relatedStockBadge, 
            { backgroundColor: isDark ? "rgba(236, 72, 153, 0.15)" : "rgba(219, 39, 119, 0.12)", borderColor: isDark ? "rgba(236, 72, 153, 0.3)" : "rgba(219, 39, 119, 0.2)" }
          ]}
          onPress={() => onShowRelationDetail(item, relationsList)}
          activeOpacity={0.7}
        >
          <Text style={[styles.relatedStockBadgeText, { color: brandColor }]}>
            {relationCount} {t("quotation.relatedStocks")} ›
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const MemoizedStockListItem = memo(StockListItem);

function ProductPickerInner(
  {
    value,
    productName,
    onChange,
    disabled = false,
    label,
    required = false,
    parentVisible = true,
    relatedStocksSelection = null,
  }: ProductPickerProps,
  ref: React.Ref<ProductPickerRef>
): React.ReactElement {
  const { t } = useTranslation();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const isDark = themeMode === "dark";
  const mainBg = isDark ? "#161224" : "#FFFFFF";
  const inputBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#F8FAFC" : "#1E293B";
  const mutedColor = isDark ? "#94A3B8" : "#64748B";
  const brandColor = isDark ? "#EC4899" : "#DB2777";

  const dashedBorderColor = isDark ? "rgba(236, 72, 153, 0.5)" : "rgba(219, 39, 119, 0.5)";
  const dashedBgColor = isDark ? "rgba(236, 72, 153, 0.05)" : "rgba(219, 39, 119, 0.03)";

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [relationDetailStock, setRelationDetailStock] = useState<StockGetDto | null>(null);
  const [relationDetailVisible, setRelationDetailVisible] = useState(false);
  const [relationDetailData, setRelationDetailData] = useState<StockRelationDto[]>([]);
  const [relatedSelectedIds, setRelatedSelectedIds] = useState<Set<number>>(new Set());

  const relatedMandatory = useMemo(
    () => (relatedStocksSelection?.stock.parentRelations ?? []).filter((r) => r.isMandatory),
    [relatedStocksSelection]
  );
  const relatedOptional = useMemo(
    () => (relatedStocksSelection?.stock.parentRelations ?? []).filter((r) => !r.isMandatory),
    [relatedStocksSelection]
  );

  useEffect(() => {
    if (relatedStocksSelection) {
      setRelatedSelectedIds(new Set(relatedMandatory.map((r) => r.relatedStockId)));
    }
  }, [relatedStocksSelection, relatedMandatory]);

  const toggleRelatedOptional = useCallback((relatedStockId: number) => {
    setRelatedSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(relatedStockId)) next.delete(relatedStockId);
      else next.add(relatedStockId);
      return next;
    });
  }, []);

  const handleRelatedApply = useCallback(() => {
    if (!relatedStocksSelection) return;
    const orderedIds: number[] = [];
    relatedMandatory.forEach((r) => orderedIds.push(r.relatedStockId));
    relatedOptional.forEach((r) => {
      if (relatedSelectedIds.has(r.relatedStockId)) orderedIds.push(r.relatedStockId);
    });
    relatedStocksSelection.onApply(orderedIds);
  }, [relatedStocksSelection, relatedMandatory, relatedOptional, relatedSelectedIds]);

  const handleRelatedCancel = useCallback(() => {
    relatedStocksSelection?.onCancel();
  }, [relatedStocksSelection]);

  useEffect(() => {
    if (!parentVisible) {
      setIsOpen(false);
      setSearchText("");
    }
  }, [parentVisible]);

  const filters: PagedFilter[] | undefined = useMemo(() => {
    if (searchText.trim().length >= 2) {
      return [
        { column: "stockName", operator: "contains", value: searchText.trim() },
        { column: "erpStockCode", operator: "contains", value: searchText.trim() },
      ];
    }
    return undefined;
  }, [searchText]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useStocks({
    filters,
  });

  const stocks = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  const handleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setSearchText("");
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchText("");
  }, []);

  useImperativeHandle(ref, () => ({ close: handleClose }), [handleClose]);

  const handleSelect = useCallback(
    async (stock: StockGetDto) => {
      const result = await Promise.resolve(onChange(stock));
      if (result !== false) {
        handleClose();
      }
    },
    [onChange, handleClose]
  );

  const handleClear = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleShowRelationDetail = useCallback((stock: StockGetDto, relations: StockRelationDto[]) => {
    setRelationDetailStock(stock);
    setRelationDetailData(relations);
    setRelationDetailVisible(true);
  }, []);

  const handleCloseRelationDetail = useCallback(() => {
    setRelationDetailVisible(false);
    setRelationDetailStock(null);
    setRelationDetailData([]);
  }, []);

  const renderStockItem = useCallback(
    ({ item }: { item: StockGetDto }) => (
      <MemoizedStockListItem
        item={item}
        isSelected={value === item.erpStockCode}
        colors={colors}
        onSelect={() => handleSelect(item)}
        onShowRelationDetail={handleShowRelationDetail}
        modalOpen={isOpen}
      />
    ),
    [value, colors, handleSelect, handleShowRelationDetail, isOpen]
  );

  return (
    <>
      <View style={styles.container}>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: mutedColor }]}>{label}</Text>
            {required && <Text style={[styles.required, { color: "#ef4444" }]}>*</Text>}
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.pickerButton,
            {
              backgroundColor: productName ? inputBg : dashedBgColor,
              borderColor: productName ? borderColor : dashedBorderColor,
              borderWidth: productName ? 1 : 1.5,
              borderStyle: productName ? "solid" : "dashed",
            },
            disabled && styles.pickerButtonDisabled,
          ]}
          onPress={handleOpen}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View style={styles.pickerButtonContent}>
            <Text
              style={[
                styles.pickerText,
                { color: productName ? textColor : brandColor },
                !productName && { fontWeight: "600" }
              ]}
              numberOfLines={1}
            >
              {productName || "Ürün seçmek için dokunun"}
            </Text>
            {productName ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <Text style={[styles.clearButtonText, { color: mutedColor }]}>✕</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.chevronDown, { borderTopColor: brandColor }]} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={relatedStocksSelection ? handleRelatedCancel : relationDetailVisible ? handleCloseRelationDetail : handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={relatedStocksSelection ? handleRelatedCancel : relationDetailVisible ? handleCloseRelationDetail : handleClose}
          />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: mainBg, paddingBottom: insets.bottom + 16 },
            ]}
          >
            {relatedStocksSelection ? (
              <View style={styles.relatedSelectWrapper}>
                <View style={[styles.modalHeader, styles.relationDetailHeaderRow, { borderBottomColor: borderColor }]}>
                  <Text style={[styles.modalTitle, { color: textColor }, styles.relationDetailTitle]} numberOfLines={1}>
                    {t("quotation.relatedStocksSelectTitle")}
                  </Text>
                </View>
                <Text style={[styles.relatedSelectDesc, { color: mutedColor }]}>
                  {t("quotation.relatedStocksSelectDesc")}
                </Text>
                <FlatListScrollView
                  style={styles.relatedSelectScroll}
                  contentContainerStyle={styles.relatedSelectScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {relatedMandatory.length > 0 && (
                    <View style={styles.relatedSelectBlock}>
                      <Text style={[styles.relatedSelectBlockTitle, { color: mutedColor }]}>{t("quotation.mandatory")}</Text>
                      {relatedMandatory.map((r) => (
                        <View key={r.id} style={[styles.relatedSelectRow, { borderBottomColor: borderColor }]}>
                          <View style={[styles.relatedSelectCheckbox, { borderColor: borderColor, backgroundColor: brandColor + "30" }]}>
                            <Text style={[styles.relatedSelectCheckmark, { color: brandColor }]}>✓</Text>
                          </View>
                          <View style={styles.relatedSelectRowContent}>
                            <Text style={[styles.relatedSelectRowName, { color: textColor }]} numberOfLines={1}>
                              {r.relatedStockName || r.relatedStockCode || `#${r.relatedStockId}`}
                            </Text>
                            <Text style={[styles.relatedSelectRowMeta, { color: mutedColor }]}>
                              {t("quotation.quantity")}: {r.quantity}
                              {r.description ? ` · ${r.description}` : ""}
                            </Text>
                          </View>
                          <View style={[styles.relatedSelectBadge, { backgroundColor: "#10B98120" }]}>
                            <Text style={[styles.relatedSelectBadgeText, { color: "#10B981" }]}>{t("quotation.mandatory")}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  {relatedOptional.length > 0 && (
                    <View style={styles.relatedSelectBlock}>
                      <Text style={[styles.relatedSelectBlockTitle, { color: mutedColor }]}>{t("quotation.optional")}</Text>
                      {relatedOptional.map((r) => {
                        const isChecked = relatedSelectedIds.has(r.relatedStockId);
                        return (
                          <TouchableOpacity
                            key={r.id}
                            style={[styles.relatedSelectRow, { borderBottomColor: borderColor }]}
                            onPress={() => toggleRelatedOptional(r.relatedStockId)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.relatedSelectCheckbox, { borderColor: borderColor, backgroundColor: isChecked ? brandColor + "30" : "transparent" }]}>
                              {isChecked && <Text style={[styles.relatedSelectCheckmark, { color: brandColor }]}>✓</Text>}
                            </View>
                            <View style={styles.relatedSelectRowContent}>
                              <Text style={[styles.relatedSelectRowName, { color: textColor }]} numberOfLines={1}>
                                {r.relatedStockName || r.relatedStockCode || `#${r.relatedStockId}`}
                              </Text>
                              <Text style={[styles.relatedSelectRowMeta, { color: mutedColor }]}>
                                {t("quotation.quantity")}: {r.quantity}
                                {r.description ? ` · ${r.description}` : ""}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </FlatListScrollView>
                <View style={[styles.relatedSelectFooter, { borderTopColor: borderColor, backgroundColor: mainBg }]}>
                  <TouchableOpacity style={[styles.relatedSelectCancelBtn, { borderColor: borderColor }]} onPress={handleRelatedCancel}>
                    <Text style={[styles.relatedSelectCancelText, { color: textColor }]}>{t("common.cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.relatedSelectApplyBtn, { backgroundColor: brandColor }]} onPress={handleRelatedApply}>
                    <Text style={styles.relatedSelectApplyText}>{t("quotation.apply")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : relationDetailVisible ? (
              <View style={styles.relationDetailWrapper}>
                <View
                  style={[
                    styles.modalHeader,
                    styles.relationDetailHeaderRow,
                    { borderBottomColor: borderColor },
                  ]}
                >
                  <TouchableOpacity onPress={handleCloseRelationDetail} style={styles.backButton}>
                    <Text style={[styles.backButtonText, { color: brandColor }]}>←</Text>
                  </TouchableOpacity>
                  <Text
                    style={[styles.modalTitle, { color: textColor }, styles.relationDetailTitle]}
                    numberOfLines={1}
                  >
                    {relationDetailStock
                      ? `${relationDetailStock.erpStockCode} – Bağlı Stoklar`
                      : "Bağlı Stoklar"}
                  </Text>
                  <TouchableOpacity onPress={handleCloseRelationDetail} style={styles.closeButton}>
                    <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                {relationDetailData.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: mutedColor }]}>
                      Bu ürünün bağlı stoğu bulunmuyor
                    </Text>
                  </View>
                ) : (
                  <FlatListScrollView
                    style={styles.relationDetailScroll}
                    contentContainerStyle={styles.relationDetailScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={[styles.relationDetailCount, { color: mutedColor }]}>
                      {relationDetailData.length} {t("quotation.relatedStocks").toLowerCase()}
                    </Text>
                    {relationDetailData.map((r) => {
                      const isInverse = relationDetailStock && r.relatedStockId === relationDetailStock.id;
                      const name =
                        r.relatedStockName ||
                        r.relatedStockCode ||
                        (isInverse ? `Stok #${r.stockId}` : `#${r.relatedStockId}`);
                      return (
                        <View
                          key={r.id}
                          style={[styles.relationDetailRow, { borderBottomColor: borderColor }]}
                        >
                          <View style={styles.relationDetailRowContent}>
                            <Text style={[styles.relationDetailRowName, { color: textColor }]} numberOfLines={1}>
                              {name}
                            </Text>
                            <Text style={[styles.relationDetailRowMeta, { color: mutedColor }]}>
                              Miktar: {r.quantity}
                              {r.description ? ` · ${r.description}` : ""}
                              {r.isMandatory ? " · Zorunlu" : ""}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </FlatListScrollView>
                )}
              </View>
            ) : (
              <>
                <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                  <View style={[styles.handle, { backgroundColor: borderColor }]} />
                  <View style={styles.headerRow}>
                    <View style={[styles.productIcon, { backgroundColor: brandColor }]}>
                      <Text style={styles.productIconText}>📦</Text>
                    </View>
                    <View style={styles.headerTitles}>
                      <Text style={[styles.modalTitle, { color: textColor }]}>
                        {label || "Ürün"}
                      </Text>
                      <Text style={[styles.modalSubtitle, { color: mutedColor }]}>
                        {t("quotation.selectProduct")}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                      <Text style={[styles.closeButtonText, { color: textColor }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.searchRow, { backgroundColor: inputBg, borderBottomColor: borderColor }]}>
                  <TextInput
                    style={[styles.searchInput, { color: textColor, borderColor: borderColor }]}
                    placeholder="Ürün adı veya kodu ile ara..."
                    placeholderTextColor={mutedColor}
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus
                  />
                  <VoiceSearchButton onResult={setSearchText} />
                </View>

                {isLoading && stocks.length === 0 ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={brandColor} />
                  </View>
                ) : stocks.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: mutedColor }]}>
                      {searchText.trim().length >= 2
                        ? "Sonuç bulunamadı"
                        : "Arama yapmak için en az 2 karakter giriniz"}
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={stocks}
                    renderItem={renderStockItem}
                    keyExtractor={(item) => String(item.id)}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                      isFetchingNextPage ? (
                        <View style={styles.footerLoading}>
                          <ActivityIndicator size="small" color={brandColor} />
                        </View>
                      ) : null
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

export const ProductPicker = forwardRef<ProductPickerRef, ProductPickerProps>(ProductPickerInner);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  required: {
    fontSize: 14,
    marginLeft: 4,
  },
  pickerButton: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: "center",
  },
  pickerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chevronDown: {
    width: 0,
    height: 0,
    marginLeft: 8,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  pickerButtonDisabled: {
    opacity: 0.6,
  },
  pickerText: {
    fontSize: 15,
    flex: 1,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  handle: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [{ translateX: -22 }],
    width: 44,
    height: 5,
    borderRadius: 3,
    opacity: 0.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  productIconText: {
    fontSize: 18,
  },
  headerTitles: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },
  closeButton: {
    padding: 6,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "700",
  },
  relationDetailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  relationDetailTitle: {
    flex: 1,
  },
  closeButtonText: {
    fontSize: 22,
    fontWeight: "300",
    opacity: 0.7,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 40,
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  stockItemTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stockInfo: {
    flex: 1,
    marginRight: 12,
  },
  relatedStockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  relatedStockBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stockName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  stockCode: {
    fontSize: 13,
    fontWeight: "500",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
  },
  relationDetailWrapper: {
    flex: 1,
  },
  relationDetailScroll: {
    flex: 1,
  },
  relationDetailScrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  relationDetailCount: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  relationDetailRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  relationDetailRowContent: {
    flex: 1,
  },
  relationDetailRowName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  relationDetailRowMeta: {
    fontSize: 13,
  },
  relatedSelectWrapper: {
    flex: 1,
  },
  relatedSelectDesc: {
    fontSize: 13,
    paddingHorizontal: 20,
    paddingVertical: 12,
    lineHeight: 20,
  },
  relatedSelectScroll: {
    flex: 1,
  },
  relatedSelectScrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  relatedSelectBlock: {
    marginBottom: 20,
  },
  relatedSelectBlockTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  relatedSelectRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  relatedSelectCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  relatedSelectCheckmark: {
    fontSize: 14,
    fontWeight: "700",
  },
  relatedSelectRowContent: {
    flex: 1,
  },
  relatedSelectRowName: {
    fontSize: 15,
    fontWeight: "600",
  },
  relatedSelectRowMeta: {
    fontSize: 13,
    marginTop: 4,
  },
  relatedSelectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relatedSelectBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  relatedSelectFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  relatedSelectCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  relatedSelectCancelText: {
    fontSize: 15,
    fontWeight: "700",
  },
  relatedSelectApplyBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  relatedSelectApplyText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});