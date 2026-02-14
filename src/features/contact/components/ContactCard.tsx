import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { LinearGradient } from "expo-linear-gradient";
import type { ContactDto } from "../types";
// HugeIcons - CRM Premium Seti
import { 
  Call02Icon, 
  Mail01Icon, 
  Building03Icon, 
  SmartPhone01Icon,
  Briefcase02Icon
} from "hugeicons-react-native";

interface ContactCardProps {
  contact: ContactDto;
  onPress: () => void;
}

function ContactCardComponent({ contact, onPress }: ContactCardProps): React.ReactElement {
  const { colors, themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  // Tasarım Sabitleri
  const cardBg = isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF";
  const neonBorder = isDark ? "rgba(236, 72, 153, 0.25)" : "rgba(236, 72, 153, 0.15)";
  const iconColor = isDark ? "#94A3B8" : "#64748B";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: cardBg, borderColor: neonBorder },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* ÜST BÖLÜM: AVATAR VE İSİM */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: "rgba(236, 72, 153, 0.15)", borderColor: "rgba(236, 72, 153, 0.3)" }]}>
          <Text style={styles.avatarText}>
            {contact.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {contact.fullName}
          </Text>
          {contact.titleName && (
            <View style={styles.titleWrapper}>
               <Briefcase02Icon size={12} color={colors.textMuted} variant="stroke" />
               <Text style={[styles.title, { color: colors.textMuted }]}>{contact.titleName}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ŞİRKET BİLGİSİ (BADGE) */}
      {contact.customerName && (
        <View style={[styles.customerBadge, { backgroundColor: isDark ? "rgba(236, 72, 153, 0.1)" : "#FCE7F3" }]}>
          <Building03Icon size={14} color="#db2777" variant="stroke" />
          <Text style={[styles.customerNameText, { color: isDark ? "#f472b6" : "#db2777" }]} numberOfLines={1}>
            {contact.customerName}
          </Text>
        </View>
      )}

      {/* İLETİŞİM DETAYLARI */}
      <View style={styles.details}>
        {contact.phone && (
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
               <Call02Icon size={14} color={iconColor} />
            </View>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {contact.phone}
            </Text>
          </View>
        )}
        
        {contact.mobile && (
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
               <SmartPhone01Icon size={14} color={iconColor} />
            </View>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {contact.mobile}
            </Text>
          </View>
        )}
        
        {contact.email && (
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
               <Mail01Icon size={14} color={iconColor} />
            </View>
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {contact.email}
            </Text>
          </View>
        )}
      </View>

      {/* ALT PARLAMA ÇİZGİSİ */}
      {isDark && (
        <LinearGradient
          colors={["transparent", "rgba(236, 72, 153, 0.15)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomGlow}
        />
      )}
    </TouchableOpacity>
  );
}

export const ContactCard = memo(ContactCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#ec4899",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ec4899",
  },
  headerContent: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: "500",
  },
  customerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    alignSelf: 'flex-start',
  },
  customerNameText: {
    fontSize: 13,
    fontWeight: "700",
    maxWidth: 250,
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  }
});