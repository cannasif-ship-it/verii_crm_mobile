import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useToast } from "../../../hooks/useToast";
import { tempQuickQuotationRepository } from "../repositories/tempQuotattion.repository";
import type { TempQuotattionGetDto } from "../models/tempQuotattion.model";

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

export function TempQuickQuotationListScreen(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();
  const { colors } = useUIStore();

  const queryKey = ["temp-quick-quotation", "list"] as const;

  const listQuery = useQuery({
    queryKey,
    queryFn: () =>
      tempQuickQuotationRepository.getList({
        pageNumber: 1,
        pageSize: 100,
        sortBy: "id",
        sortDirection: "desc",
      }),
  });

  const convertMutation = useMutation({
    mutationFn: (id: number) => tempQuickQuotationRepository.approveAndConvertToQuotation(id),
    onSuccess: () => {
      showSuccess("Hızlı teklif teklife dönüştürme akışına alındı");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : "Teklife dönüştürme başarısız");
    },
  });

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);

  const handleCreate = (): void => {
    router.push("/(tabs)/sales/quotations/quick/create");
  };

  const handleRevise = (id: number): void => {
    router.push({ pathname: "/(tabs)/sales/quotations/quick/create", params: { id: String(id) } });
  };

  const handleConvert = (id: number): void => {
    convertMutation.mutate(id);
  };

  const renderItem = ({ item }: { item: TempQuotattionGetDto }): React.ReactElement => {
    return (
      <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}> 
        <View style={styles.rowBetween}>
          <Text style={[styles.title, { color: colors.text }]}>#{item.id}</Text>
          <Text style={[styles.badge, { color: item.isApproved ? "#16a34a" : "#f59e0b" }]}> 
            {item.isApproved ? "Onaylandı" : "Taslak"}
          </Text>
        </View>

        <Text style={[styles.line, { color: colors.textSecondary }]}>Müşteri ID: {item.customerId}</Text>
        <Text style={[styles.line, { color: colors.textSecondary }]}>Para Birimi: {item.currencyCode}</Text>
        <Text style={[styles.line, { color: colors.textSecondary }]}>Tarih: {formatDate(item.offerDate)}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.reviseButton]}
            onPress={() => handleRevise(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>Revize Et</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.convertButton]}
            onPress={() => handleConvert(item.id)}
            activeOpacity={0.8}
            disabled={convertMutation.isPending}
          >
            <Text style={styles.actionText}>Teklife Dönüştür</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScreenHeader title="Hızlı Teklif Listele" showBackButton />

      <View style={styles.topBar}>
        <TouchableOpacity style={[styles.newButton, { backgroundColor: "#db2777" }]} onPress={handleCreate}>
          <Text style={styles.newButtonText}>Hızlı Teklif Oluştur</Text>
        </TouchableOpacity>
      </View>

      {listQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#db2777" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshing={listQuery.isFetching}
          onRefresh={listQuery.refetch}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: colors.textMuted }}>Kayıt bulunamadı</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  newButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  newButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
  },
  badge: {
    fontWeight: "700",
    fontSize: 12,
  },
  line: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
  reviseButton: {
    backgroundColor: "#0ea5e9",
  },
  convertButton: {
    backgroundColor: "#16a34a",
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
});
