import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { ShippingAddressDto } from "../types";

interface ShippingAddressCardProps {
  address: ShippingAddressDto;
  onPress: () => void;
}

function ShippingAddressCardComponent({
  address,
  onPress,
}: ShippingAddressCardProps): React.ReactElement {
  const { colors } = useUIStore();

  const locationParts: string[] = [];
  if (address.cityName) {
    locationParts.push(address.cityName);
  }
  if (address.districtName) {
    locationParts.push(address.districtName);
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
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.address, { color: colors.text }]} numberOfLines={2}>
            {address.address}
          </Text>
          {location && (
            <Text style={[styles.location, { color: colors.textMuted }]}>{location}</Text>
          )}
        </View>
        {address.isActive && (
          <View style={[styles.activeBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
            <Text style={[styles.activeBadgeText, { color: colors.success }]}>Aktif</Text>
          </View>
        )}
      </View>

      {address.customerName && (
        <View style={[styles.customerBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={styles.customerIcon}>🏢</Text>
          <Text style={[styles.customerName, { color: colors.textSecondary }]} numberOfLines={1}>
            {address.customerName}
          </Text>
        </View>
      )}

      <View style={styles.details}>
        {address.contactPerson && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👤</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {address.contactPerson}
            </Text>
          </View>
        )}
        {address.phone && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {address.phone}
            </Text>
          </View>
        )}
        {address.postalCode && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📮</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {address.postalCode}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const ShippingAddressCard = memo(ShippingAddressCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  headerContent: {
    flex: 1,
  },
  address: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
    lineHeight: 20,
  },
  location: {
    fontSize: 13,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  customerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  customerIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  customerName: {
    fontSize: 13,
    flex: 1,
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
