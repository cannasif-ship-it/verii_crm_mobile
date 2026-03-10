import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FlatListScrollView } from "@/components/FlatListScrollView";
import { Text } from "../../../components/ui/text";
import { integrationApi, type CustomerMailLogDto } from "../../integration";

type MailProvider = "google" | "outlook";

interface Customer360MailLogsTabProps {
  customerId: number;
  colors: Record<string, string>;
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  return date.toLocaleString(locale);
}

function StatusBadge({
  ok,
  colors,
  successText,
  failedText,
}: {
  ok: boolean;
  colors: Record<string, string>;
  successText: string;
  failedText: string;
}): React.ReactElement {
  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: ok ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
          borderColor: ok ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)",
        },
      ]}
    >
      <Text style={[styles.statusText, { color: ok ? "#10b981" : "#ef4444" }]}>
        {ok ? successText : failedText}
      </Text>
    </View>
  );
}

function MailLogCard({
  log,
  colors,
  locale,
  successText,
  failedText,
}: {
  log: CustomerMailLogDto;
  colors: Record<string, string>;
  locale: string;
  successText: string;
  failedText: string;
}): React.ReactElement {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardDate, { color: colors.textMuted }]}>{formatDate(log.createdDate, locale)}</Text>
        <StatusBadge ok={log.isSuccess} colors={colors} successText={successText} failedText={failedText} />
      </View>

      <Text style={[styles.cardSubject, { color: colors.text }]} numberOfLines={2}>
        {log.subject || "-"}
      </Text>
      <Text style={[styles.cardLine, { color: colors.textMuted }]} numberOfLines={1}>
        {log.toEmails || "-"}
      </Text>
      <Text style={[styles.cardLine, { color: colors.textMuted }]} numberOfLines={1}>
        {log.sentByUserName || "-"}
      </Text>
      {log.errorCode ? (
        <Text style={[styles.errorLine, { color: "#ef4444" }]}>
          {log.errorCode}
        </Text>
      ) : null}
    </View>
  );
}

export function Customer360MailLogsTab({
  customerId,
  colors,
}: Customer360MailLogsTabProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "tr" ? "tr-TR" : "en-US";
  const [provider, setProvider] = useState<MailProvider>("google");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const query = useQuery({
    queryKey: ["customer360", "mail-logs", provider, customerId, pageNumber, pageSize],
    queryFn: () =>
      provider === "google"
        ? integrationApi.getGoogleCustomerMailLogs({
            customerId,
            pageNumber,
            pageSize,
            sortBy: "createdDate",
            sortDirection: "desc",
          })
        : integrationApi.getOutlookCustomerMailLogs({
            customerId,
            pageNumber,
            pageSize,
            sortBy: "createdDate",
            sortDirection: "desc",
          }),
    enabled: customerId > 0,
  });

  const logs = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  return (
    <FlatListScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.providerRow}>
        <TouchableOpacity
          style={[
            styles.providerButton,
            {
              borderColor: provider === "google" ? "#4285F4" : colors.cardBorder,
              backgroundColor: provider === "google" ? "rgba(66,133,244,0.12)" : colors.card,
            },
          ]}
          onPress={() => {
            setProvider("google");
            setPageNumber(1);
          }}
        >
          <Text style={[styles.providerText, { color: provider === "google" ? "#4285F4" : colors.text }]}>
            {t("customer360.mail.providers.google")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.providerButton,
            {
              borderColor: provider === "outlook" ? "#0078D4" : colors.cardBorder,
              backgroundColor: provider === "outlook" ? "rgba(0,120,212,0.12)" : colors.card,
            },
          ]}
          onPress={() => {
            setProvider("outlook");
            setPageNumber(1);
          }}
        >
          <Text style={[styles.providerText, { color: provider === "outlook" ? "#0078D4" : colors.text }]}>
            {t("customer360.mail.providers.outlook")}
          </Text>
        </TouchableOpacity>
      </View>

      {query.isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : query.isError ? (
        <View style={styles.centered}>
          <Text style={{ color: colors.error }}>{t("customer360.analytics.error")}</Text>
          <TouchableOpacity onPress={() => query.refetch()} style={styles.retryButton}>
            <Text style={{ color: colors.accent, fontWeight: "700" }}>{t("customer360.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: colors.textMuted }}>{t("common.noData")}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {logs.map((log) => (
            <MailLogCard
              key={log.id}
              log={log}
              colors={colors}
              locale={locale}
              successText={t("customer360.mail.status.success")}
              failedText={t("customer360.mail.status.failed")}
            />
          ))}
        </View>
      )}

      <View style={styles.paginationRow}>
        <TouchableOpacity
          style={[styles.paginationButton, { borderColor: colors.cardBorder }]}
          onPress={() => setPageNumber((prev) => Math.max(1, prev - 1))}
          disabled={!query.data?.hasPreviousPage}
        >
          <Text style={{ color: query.data?.hasPreviousPage ? colors.text : colors.textMuted }}>
            {t("common.back")}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: colors.textMuted }}>
          {query.data?.pageNumber ?? pageNumber} / {query.data?.totalPages ?? 1}
        </Text>
        <TouchableOpacity
          style={[styles.paginationButton, { borderColor: colors.cardBorder }]}
          onPress={() => setPageNumber((prev) => prev + 1)}
          disabled={!query.data?.hasNextPage}
        >
          <Text style={{ color: query.data?.hasNextPage ? colors.text : colors.textMuted }}>
            {t("common.next")}
          </Text>
        </TouchableOpacity>
      </View>
    </FlatListScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 100, gap: 12 },
  providerRow: {
    flexDirection: "row",
    gap: 8,
  },
  providerButton: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  providerText: {
    fontSize: 13,
    fontWeight: "700",
  },
  centered: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  retryButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  list: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardSubject: {
    fontSize: 14,
    fontWeight: "700",
  },
  cardLine: {
    fontSize: 12,
  },
  errorLine: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  paginationRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paginationButton: {
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 72,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});
