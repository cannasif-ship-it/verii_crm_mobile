import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { CariDto } from "../types";

interface ErpCustomerCardProps {
  customer: CariDto;
  onPress: () => void;
}

function ErpCustomerCardComponent({ customer, onPress }: ErpCustomerCardProps): React.ReactElement {
  const { colors } = useUIStore();

  const locationParts: string[] = [];
  if (customer.cariIl) {
    locationParts.push(customer.cariIl);
  }
  if (customer.cariIlce) {
    locationParts.push(customer.cariIlce);
  }
  const location = locationParts.join(", ");

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {customer.cariIsim || customer.cariKod}
          </Text>
          <Text style={[styles.code, { color: colors.textMuted }]}>
            {customer.cariKod}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.activeBackground }]}>
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            ERP
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        {customer.cariTel && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {customer.cariTel}
            </Text>
          </View>
        )}
        {customer.email && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>✉️</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {customer.email}
            </Text>
          </View>
        )}
        {location && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{location}</Text>
          </View>
        )}
        {customer.vergiNumarasi && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📋</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {customer.vergiNumarasi}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const ErpCustomerCard = memo(ErpCustomerCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  code: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  details: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
});
