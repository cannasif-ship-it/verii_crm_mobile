import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { VoiceSearchButton } from "./VoiceSearchButton";
import { useStocks } from "../../stocks/hooks";
import type { StockGetDto, PagedFilter } from "../../stocks/types";

interface ProductPickerProps {
  value?: string;
  productName?: string;
  onChange: (stock: StockGetDto | undefined) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  parentVisible?: boolean;
}

export function ProductPicker({
  value,
  productName,
  onChange,
  disabled = false,
  label,
  required = false,
  parentVisible = true,
}: ProductPickerProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();
  const insets = useSafeAreaInsets();

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

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

  const handleSelect = useCallback(
    (stock: StockGetDto) => {
      onChange(stock);
      handleClose();
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

  const renderStockItem = useCallback(
    ({ item }: { item: StockGetDto }) => {
      const isSelected = value === item.erpStockCode;

      return (
        <TouchableOpacity
          style={[
            styles.stockItem,
            { borderBottomColor: colors.border },
            isSelected && { backgroundColor: colors.accent + "15" },
          ]}
          onPress={() => handleSelect(item)}
        >
          <View style={styles.stockInfo}>
            <Text style={[styles.stockName, { color: colors.text }]} numberOfLines={1}>
              {item.stockName}
            </Text>
            <Text style={[styles.stockCode, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.erpStockCode}
            </Text>
          </View>
          {isSelected && (
            <View style={[styles.checkmark, { backgroundColor: colors.accent }]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [value, colors, handleSelect]
  );

  return (
    <>
      <View style={styles.container}>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            {required && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.pickerButton,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
            disabled && styles.pickerButtonDisabled,
          ]}
          onPress={handleOpen}
          disabled={disabled}
        >
          <Text
            style={[
              styles.pickerText,
              { color: productName ? colors.text : colors.textMuted },
            ]}
            numberOfLines={1}
          >
            {productName || "Ürün seçiniz"}
          </Text>
          {productName && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <Text style={[styles.clearButtonText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={handleClose} />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 },
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {label || "Ürün Seçiniz"}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.searchRow, { backgroundColor: colors.backgroundSecondary }]}>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Ürün adı veya kodu ile ara..."
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              <VoiceSearchButton onResult={setSearchText} />
            </View>

            {isLoading && stocks.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : stocks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
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
                      <ActivityIndicator size="small" color={colors.accent} />
                    </View>
                  ) : null
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  required: {
    fontSize: 14,
    marginLeft: 4,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    textAlign: "center",
  },
  listContent: {
    paddingVertical: 8,
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  stockInfo: {
    flex: 1,
    marginRight: 12,
  },
  stockName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  stockCode: {
    fontSize: 13,
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
    fontWeight: "600",
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
