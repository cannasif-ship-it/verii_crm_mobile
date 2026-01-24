import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { CustomerDto } from "../types";

interface CustomerCardProps {
  customer: CustomerDto;
  onPress: () => void;
}

function CustomerCardComponent({ customer, onPress }: CustomerCardProps): React.ReactElement {
  const { colors } = useUIStore();

  const locationParts: string[] = [];
  if (customer.cityName) {
    locationParts.push(customer.cityName);
  }
  if (customer.districtName) {
    locationParts.push(customer.districtName);
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
            {customer.name}
          </Text>
          {customer.customerCode && (
            <Text style={[styles.code, { color: colors.textMuted }]}>
              {customer.customerCode}
            </Text>
          )}
        </View>
        {customer.customerTypeName && (
          <View style={[styles.badge, { backgroundColor: colors.activeBackground }]}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {customer.customerTypeName}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        {customer.phone && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {customer.phone}
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
      </View>
    </TouchableOpacity>
  );
}

export const CustomerCard = memo(CustomerCardComponent);

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
