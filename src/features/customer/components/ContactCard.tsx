import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { ContactDto } from "../types";

interface ContactCardProps {
  contact: ContactDto;
  onPress: () => void;
}

function ContactCardComponent({ contact, onPress }: ContactCardProps): React.ReactElement {
  const { colors } = useUIStore();

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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {contact.fullName}
          </Text>
          {contact.titleName && (
            <Text style={[styles.title, { color: colors.textMuted }]}>{contact.titleName}</Text>
          )}
        </View>
      </View>

      {contact.customerName && (
        <View style={[styles.customerBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={styles.customerIcon}>🏢</Text>
          <Text style={[styles.customerName, { color: colors.textSecondary }]} numberOfLines={1}>
            {contact.customerName}
          </Text>
        </View>
      )}

      <View style={styles.details}>
        {contact.phone && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {contact.phone}
            </Text>
          </View>
        )}
        {contact.mobile && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📱</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {contact.mobile}
            </Text>
          </View>
        )}
        {contact.email && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>✉️</Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {contact.email}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const ContactCard = memo(ContactCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(236, 72, 153, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ec4899",
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
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
