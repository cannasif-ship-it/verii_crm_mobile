import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet, Linking, Platform } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { LinearGradient } from "expo-linear-gradient";
import type { ContactDto } from "../types";

import { 
  Call02Icon, 
  Mail01Icon, 
  Building03Icon, 
  SmartPhone01Icon,
  Briefcase02Icon,
  ArrowRight01Icon
} from "hugeicons-react-native";

interface ContactListCardProps {
  contact: ContactDto;
  onPress: () => void;
}

function ContactListCardComponent({ contact, onPress }: ContactListCardProps): React.ReactElement {
  const { colors, themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const cardBg = isDark ? "rgba(255, 255, 255, 0.02)" : "#FFFFFF"; 
  const borderColor = isDark ? "rgba(236, 72, 153, 0.15)" : "rgba(0, 0, 0, 0.12)";
  
  const iconColor = isDark ? "#94A3B8" : "#64748B";
  const primaryNeon = "#db2777";

  const emptyIconColor = isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.15)";

  const handleCall = () => {
    const number = contact.mobile || contact.phone;
    if (number) Linking.openURL(`tel:${number}`);
  };

  const handleEmail = () => {
    if (contact.email) Linking.openURL(`mailto:${contact.email}`);
  };

  const hasPhone = !!(contact.mobile || contact.phone);
  const hasEmail = !!contact.email;

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { backgroundColor: cardBg, borderColor: borderColor },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient 
        colors={[primaryNeon, "#ec4899", "transparent"]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 0 }} 
        style={styles.topGradientBar} 
      />

      <View style={styles.profileSection}>
        
        <View style={[styles.avatar, { backgroundColor: isDark ? "rgba(219, 39, 119, 0.12)" : "#FCE7F3", borderColor: isDark ? "rgba(219, 39, 119, 0.3)" : "rgba(219, 39, 119, 0.1)" }]}>
          <Text style={styles.avatarText}>
            {contact.fullName?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {contact.fullName || "İsimsiz Kişi"}
          </Text>

          <View style={styles.badgeRow}>
            <Briefcase02Icon size={10} color={colors.textMuted} variant="stroke" />
            <Text style={[styles.title, { color: contact.titleName ? colors.textMuted : emptyIconColor, fontStyle: contact.titleName ? 'normal' : 'italic' }]} numberOfLines={1}>
              {contact.titleName || "Ünvan belirtilmemiş"}
            </Text>
          </View>

          {contact.customerName && (
            <View style={styles.badgeRow}>
              <Building03Icon size={10} color={isDark ? "#f472b6" : primaryNeon} variant="stroke" />
              <Text style={[styles.companyName, { color: isDark ? "#f472b6" : primaryNeon }]} numberOfLines={1}>
                {contact.customerName}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.actionSection, { borderTopColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" }]}>
        
        <View style={styles.contactDetails}>
          <View style={styles.contactRow}>
            <SmartPhone01Icon size={12} color={hasPhone ? iconColor : emptyIconColor} variant="stroke" />
            <Text style={[styles.contactText, { color: hasPhone ? colors.textSecondary : colors.textMuted, fontStyle: hasPhone ? 'normal' : 'italic' }]} numberOfLines={1}>
              {hasPhone ? (contact.mobile || contact.phone) : "Telefon eklenmemiş"}
            </Text>
          </View>

          <View style={styles.contactRow}>
            <Mail01Icon size={12} color={hasEmail ? iconColor : emptyIconColor} variant="stroke" />
            <Text style={[styles.contactText, { color: hasEmail ? colors.textSecondary : colors.textMuted, fontStyle: hasEmail ? 'normal' : 'italic' }]} numberOfLines={1}>
              {hasEmail ? contact.email : "E-posta eklenmemiş"}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          
          {hasPhone && (
            <TouchableOpacity 
              style={[styles.circleBtn, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5", borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "transparent", borderWidth: isDark ? 1 : 0 }]} 
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Call02Icon size={14} color={isDark ? "#34D399" : "#10B981"} variant="stroke" />
            </TouchableOpacity>
          )}

          {hasEmail && (
            <TouchableOpacity 
              style={[styles.circleBtn, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#DBEAFE", borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "transparent", borderWidth: isDark ? 1 : 0 }]} 
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <Mail01Icon size={14} color={isDark ? "#60A5FA" : "#3B82F6"} variant="stroke" />
            </TouchableOpacity>
          )}
          
          <View style={[styles.circleBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }]}>
            <ArrowRight01Icon size={14} color={isDark ? "#CBD5E1" : iconColor} variant="stroke" />
          </View>

        </View>

      </View>
    </TouchableOpacity>
  );
}

export const ContactListCard = memo(ContactListCardComponent);

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  
  topGradientBar: {
    height: 2,
    width: '100%',
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 8,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19, 
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#db2777",
  },

  infoContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 2, 
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    fontWeight: "500",
  },
  companyName: {
    fontSize: 10,
    fontWeight: "700",
  },

  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.01)', 
  },
  contactDetails: {
    flex: 1,
    gap: 4, 
    paddingRight: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, 
  },
  contactText: {
    fontSize: 10,
    fontWeight: "500",
    flex: 1,
  },

  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, 
  },
  circleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14, 
    alignItems: 'center',
    justifyContent: 'center',
  },
});