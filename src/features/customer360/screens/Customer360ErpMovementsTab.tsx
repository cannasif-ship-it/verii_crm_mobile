import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { Text } from "../../../components/ui/text";
import type {
  Customer360ErpBalanceDto,
  Customer360ErpMovementDto,
} from "../types";

interface Customer360ErpMovementsTabProps {
  balance?: Customer360ErpBalanceDto;
  items: Customer360ErpMovementDto[];
  colors: Record<string, string>;
  emptyText: string;
}

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale);
}

function formatAmount(value: number | null | undefined, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function SummaryCard({
  title,
  value,
  colors,
}: {
  title: string;
  value: string;
  colors: Record<string, string>;
}): React.ReactElement {
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{title}</Text>
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function MovementCard({
  item,
  colors,
  locale,
}: {
  item: Customer360ErpMovementDto;
  colors: Record<string, string>;
  locale: string;
}): React.ReactElement {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardDate, { color: colors.textMuted }]}>
          {formatDate(item.tarih, locale)}
        </Text>
        <Text style={[styles.cardCurrency, { color: colors.text }]}>
          {item.paraBirimi || "-"}
        </Text>
      </View>

      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {item.aciklama || item.belgeNo || "-"}
      </Text>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Belge No</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{item.belgeNo || "-"}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Vade</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatDate(item.vadeTarihi, locale)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Borç</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatAmount(item.borc, locale)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Alacak</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatAmount(item.alacak, locale)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>TL Bakiye</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatAmount(item.tarihSiraliTlBakiye, locale)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Döviz Bakiye</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>
            {formatAmount(item.tarihSiraliDovizBakiye, locale)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function Customer360ErpMovementsTab({
  balance,
  items,
  colors,
  emptyText,
}: Customer360ErpMovementsTabProps): React.ReactElement {
  const { i18n, t } = useTranslation();
  const locale =
    i18n.language === "tr" ? "tr-TR" : i18n.language === "de" ? "de-DE" : "en-US";

  return (
    <FlatListScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryRow}>
        <SummaryCard
          title={t("customer360.erpMovements.summary.totalDebit")}
          value={formatAmount(balance?.toplamBorc, locale)}
          colors={colors}
        />
        <SummaryCard
          title={t("customer360.erpMovements.summary.totalCredit")}
          value={formatAmount(balance?.toplamAlacak, locale)}
          colors={colors}
        />
        <SummaryCard
          title={`${t("customer360.erpMovements.summary.balance")} · ${balance?.bakiyeDurumu ?? t("customer360.erpMovements.summary.closed")}`}
          value={formatAmount(balance?.bakiyeTutari, locale)}
          colors={colors}
        />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={{ color: colors.textMuted }}>{emptyText}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => (
            <MovementCard
              key={`${item.cariKod}-${item.tarih ?? index}-${item.belgeNo ?? index}`}
              item={item}
              colors={colors}
              locale={locale}
            />
          ))}
        </View>
      )}
    </FlatListScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 6, paddingBottom: 120, gap: 16 },
  summaryRow: { gap: 12 },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  emptyWrap: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardCurrency: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaItem: {
    width: "48%",
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
  },
});
