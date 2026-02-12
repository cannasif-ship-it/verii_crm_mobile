import React, { useMemo, useCallback, useState } from "react";
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { Text } from "../../../components/ui/text";
import { API_BASE_URL } from "../../../constants/config";
import type { StockGetDto, StockRelationDto, StockImageDto } from "../types";

function DetailRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string | number | undefined | null;
  colors: Record<string, string>;
}): React.ReactElement {
  const displayValue = value !== undefined && value !== null ? String(value) : "-";

  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{displayValue}</Text>
    </View>
  );
}

interface StockDetailContentProps {
  stock: StockGetDto | undefined;
  relations: StockRelationDto[];
  colors: Record<string, string>;
  insets: { bottom: number };
  t: (key: string) => string;
}

type TabType = "details" | "images" | "relations";

export function StockDetailContent({
  stock,
  relations,
  colors,
  insets,
  t,
}: StockDetailContentProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>("details");

  const hasImages = useMemo(() => {
    return Boolean(
      stock?.stockImages && 
      Array.isArray(stock.stockImages) && 
      stock.stockImages.length > 0 &&
      stock.stockImages.some((img) => img?.filePath)
    );
  }, [stock?.stockImages]);
  const hasRelations = useMemo(() => {
    return Boolean(Array.isArray(relations) && relations.length > 0);
  }, [relations]);

  const formatDate = useCallback((dateString: string | undefined | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getImageUri = useCallback((filePath: string): string => {
    if (!filePath) return "";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
    return `${baseUrl}${path}`;
  }, []);

  const renderImage = useCallback(
    ({ item }: { item: StockImageDto }) => {
      if (!item?.filePath) return null;
      const imageUri = getImageUri(item.filePath);
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="cover"
            onError={() => {
              console.warn("Image load error:", imageUri);
            }}
          />
          {item.altText && (
            <Text style={[styles.imageAlt, { color: colors.textMuted }]}>{item.altText}</Text>
          )}
        </View>
      );
    },
    [colors, getImageUri]
  );

  const renderRelation = useCallback(
    ({ item }: { item: StockRelationDto }) => {
      return (
        <View style={[styles.relationCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.relationHeader}>
            <Text style={[styles.relationName, { color: colors.text }]}>
              {item.relatedStockName || t("stock.unknownStock")}
            </Text>
            {item.isMandatory && (
              <View style={[styles.mandatoryBadge, { backgroundColor: "#EF444420" }]}>
                <Text style={[styles.mandatoryText, { color: "#EF4444" }]}>
                  {t("stock.mandatory")}
                </Text>
              </View>
            )}
          </View>
          {item.relatedStockCode && (
            <Text style={[styles.relationCode, { color: colors.textMuted }]}>
              {t("stock.stockCode")}: {item.relatedStockCode}
            </Text>
          )}
          <Text style={[styles.relationQuantity, { color: colors.text }]}>
            {t("stock.quantity")}: {String(item.quantity)}
          </Text>
          {item.description && (
            <Text style={[styles.relationDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          )}
        </View>
      );
    },
    [colors, t]
  );

  const renderDetailsTab = useCallback((): React.ReactElement => {
    return (
      <FlatListScrollView
        style={styles.tabContent}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={[styles.stockName, { color: colors.text }]}>{stock?.stockName}</Text>
              {stock?.erpStockCode && (
                <Text style={[styles.stockCode, { color: colors.textMuted }]}>
                  {t("stock.stockCode")}: {stock.erpStockCode}
                </Text>
              )}
            </View>
          </View>
          {stock?.branchCode !== undefined && (
            <Text style={[styles.branchText, { color: colors.textMuted }]}>
              {t("stock.branchCode")}: {String(stock.branchCode)}
            </Text>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("stock.basicInfo")}
          </Text>
          <DetailRow label={t("stock.stockCode")} value={stock?.erpStockCode} colors={colors} />
          <DetailRow label={t("stock.unit")} value={stock?.unit} colors={colors} />
          <DetailRow label={t("stock.ureticiKodu")} value={stock?.ureticiKodu} colors={colors} />
          <DetailRow label={t("stock.branchCode")} value={stock?.branchCode} colors={colors} />
          <DetailRow label={t("stock.grupKodu")} value={stock?.grupKodu} colors={colors} />
          <DetailRow label={t("stock.grupAdi")} value={stock?.grupAdi} colors={colors} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("stock.codeInfo")}
          </Text>
          <DetailRow label={t("stock.kod1")} value={stock?.kod1} colors={colors} />
          <DetailRow label={t("stock.kod1Adi")} value={stock?.kod1Adi} colors={colors} />
          <DetailRow label={t("stock.kod2")} value={stock?.kod2} colors={colors} />
          <DetailRow label={t("stock.kod2Adi")} value={stock?.kod2Adi} colors={colors} />
          <DetailRow label={t("stock.kod3")} value={stock?.kod3} colors={colors} />
          <DetailRow label={t("stock.kod3Adi")} value={stock?.kod3Adi} colors={colors} />
          <DetailRow label={t("stock.kod4")} value={stock?.kod4} colors={colors} />
          <DetailRow label={t("stock.kod4Adi")} value={stock?.kod4Adi} colors={colors} />
          <DetailRow label={t("stock.kod5")} value={stock?.kod5} colors={colors} />
          <DetailRow label={t("stock.kod5Adi")} value={stock?.kod5Adi} colors={colors} />
        </View>

        {stock?.stockDetail && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("stock.stockDetail")}
            </Text>
            {stock.stockDetail.htmlDescription && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                  {t("stock.description")}
                </Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {stock.stockDetail.htmlDescription.replace(/<[^>]*>/g, "")}
                </Text>
              </View>
            )}
            {stock.stockDetail.technicalSpecsJson && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                  {t("stock.technicalSpecs")}
                </Text>
                <Text style={[styles.detailValue, { color: colors.textSecondary }]}>
                  {stock.stockDetail.technicalSpecsJson}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("stock.systemInfo")}
          </Text>
          <DetailRow label={t("stock.createdBy")} value={stock?.createdByFullUser} colors={colors} />
          <DetailRow label={t("stock.createdDate")} value={formatDate(stock?.createdDate)} colors={colors} />
          <DetailRow label={t("stock.updatedBy")} value={stock?.updatedByFullUser} colors={colors} />
          <DetailRow label={t("stock.updatedDate")} value={formatDate(stock?.updatedDate)} colors={colors} />
          <DetailRow label={t("stock.deletedBy")} value={stock?.deletedByFullUser} colors={colors} />
          <DetailRow label={t("stock.deletedDate")} value={formatDate(stock?.deletedDate)} colors={colors} />
          {stock?.isDeleted !== undefined && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{t("stock.isDeleted")}</Text>
              <Text style={[styles.detailValue, { color: stock.isDeleted ? "#EF4444" : "#10B981" }]}>
                {stock.isDeleted ? t("common.yes") : t("common.no")}
              </Text>
            </View>
          )}
        </View>
      </FlatListScrollView>
    );
  }, [stock, colors, insets, t, formatDate]);

  const renderImageItem = useCallback(
    (item: StockImageDto): React.ReactElement | null => {
      if (!item?.filePath) return null;
      const imageUri = getImageUri(item.filePath);
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="cover"
            onError={() => {
              console.warn("Image load error:", imageUri);
            }}
          />
          {item.altText && (
            <Text style={[styles.imageAlt, { color: colors.textMuted }]}>{item.altText}</Text>
          )}
        </View>
      );
    },
    [colors, getImageUri]
  );

  const renderImagesTab = useCallback((): React.ReactElement => {
    if (!hasImages || !stock?.stockImages) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("stock.noImages")}
          </Text>
        </View>
      );
    }

    const images = stock.stockImages;
    const rows: StockImageDto[][] = [];
    for (let i = 0; i < images.length; i += 2) {
      rows.push(images.slice(i, i + 2));
    }

    return (
      <FlatListScrollView
        style={styles.tabContent}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.imageRow}>
            {row.map((item) => (
              <React.Fragment key={item.id}>
                {renderImageItem(item)}
              </React.Fragment>
            ))}
            {row.length === 1 && <View style={styles.imageContainer} />}
          </View>
        ))}
      </FlatListScrollView>
    );
  }, [hasImages, stock?.stockImages, colors, insets, t, renderImageItem]);

  const renderRelationsTab = useCallback((): React.ReactElement => {
    if (!hasRelations) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t("stock.noRelations")}
          </Text>
        </View>
      );
    }

    return (
      <FlatListScrollView
        style={styles.tabContent}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={relations}
          renderItem={renderRelation}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
        />
      </FlatListScrollView>
    );
  }, [hasRelations, relations, colors, insets, t, renderRelation]);

  const renderTabContent = useCallback((): React.ReactElement => {
    switch (activeTab) {
      case "images":
        return renderImagesTab();
      case "relations":
        return renderRelationsTab();
      default:
        return renderDetailsTab();
    }
  }, [activeTab, renderDetailsTab, renderImagesTab, renderRelationsTab]);

  return (
    <View style={styles.container}>
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "details" && [styles.activeTab, { backgroundColor: colors.accent }],
          ]}
          onPress={() => setActiveTab("details")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "details" ? "#FFFFFF" : colors.textMuted },
              activeTab === "details" && styles.activeTabText,
            ]}
          >
            {t("stock.tabDetails")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "images" && [styles.activeTab, { backgroundColor: colors.accent }],
          ]}
          onPress={() => setActiveTab("images")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "images" ? "#FFFFFF" : colors.textMuted },
              activeTab === "images" && styles.activeTabText,
            ]}
          >
            {t("stock.tabImages")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "relations" && [styles.activeTab, { backgroundColor: colors.accent }],
          ]}
          onPress={() => setActiveTab("relations")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "relations" ? "#FFFFFF" : colors.textMuted },
              activeTab === "relations" && styles.activeTabText,
            ]}
          >
            {t("stock.tabRelations")}
          </Text>
        </TouchableOpacity>
      </View>
      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderLeft: {
    flex: 1,
  },
  stockName: {
    fontSize: 20,
    fontWeight: "600",
  },
  stockCode: {
    fontSize: 14,
    marginTop: 4,
  },
  branchText: {
    fontSize: 13,
    marginTop: 8,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
  },
  imagesList: {
    paddingVertical: 8,
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  imageAlt: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  relationCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  relationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  relationName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  mandatoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  mandatoryText: {
    fontSize: 11,
    fontWeight: "500",
  },
  relationCode: {
    fontSize: 13,
    marginBottom: 4,
  },
  relationQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  relationDescription: {
    fontSize: 13,
    marginTop: 4,
  },
});
