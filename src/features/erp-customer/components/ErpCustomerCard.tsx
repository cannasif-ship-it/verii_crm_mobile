import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { LinearGradient } from "expo-linear-gradient";
import type { CariDto } from "../types";
import { 
  Call02Icon, 
  Mail01Icon, 
  Location01Icon, 
  Invoice01Icon,
  Database01Icon 
} from "hugeicons-react-native";

interface ErpCustomerCardProps {
  customer: CariDto;
  onPress: () => void;
}

function ErpCustomerCardComponent({ customer, onPress }: ErpCustomerCardProps): React.ReactElement {
  const { colors, themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const cardBg = isDark ? "rgba(255, 255, 255, 0.04)" : "#FFFFFF";
  const cardBorder = isDark ? "rgba(236, 72, 153, 0.25)" : "rgba(0, 0, 0, 0.06)";
  const iconAccent = isDark ? "rgba(236, 72, 153, 0.15)" : "#FCE7F3";
  const iconColor = isDark ? "#ec4899" : "#db2777";

  const locationParts: string[] = [];
  if (customer.cariIl) locationParts.push(customer.cariIl);
  if (customer.cariIlce) locationParts.push(customer.cariIlce);
  const location = locationParts.join(", ");

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* KARTIN ÜZERİNDEKİ HAFİF PARLAMA EFEKTİ */}
      {isDark && (
        <LinearGradient
          colors={["rgba(236, 72, 153, 0.05)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {customer.cariIsim || customer.cariKod}
          </Text>
          <View style={[styles.codeBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F8FAFC" }]}>
            <Text style={[styles.code, { color: colors.textMuted }]}>
              {customer.cariKod}
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={["#ec4899", "#f97316"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.erpBadge}
        >
          <Database01Icon size={10} color="#FFF"  />sss
          <Text style={styles.erpBadgeText}>ERP</Text>
        </LinearGradient>
      </View>

      <View style={styles.details}>
        {customer.cariTel && (
          <View style={styles.detailRow}>
            <View style={[styles.iconBox, { backgroundColor: iconAccent }]}>
              <Call02Icon size={14} color={iconColor} variant="stroke" />
            </View>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {customer.cariTel}
            </Text>
          </View>
        )}
        
        {customer.email && (
          <View style={styles.detailRow}>
            <View style={[styles.iconBox, { backgroundColor: iconAccent }]}>
              <Mail01Icon size={14} color={iconColor} variant="stroke" />
            </View>
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {customer.email}
            </Text>
          </View>
        )}
        
        {location ? (
          <View style={styles.detailRow}>
            <View style={[styles.iconBox, { backgroundColor: iconAccent }]}>
              <Location01Icon size={14} color={iconColor} variant="stroke" />
            </View>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{location}</Text>
          </View>
        ) : null}
        
        {customer.vergiNumarasi && (
          <View style={styles.detailRow}>
            <View style={[styles.iconBox, { backgroundColor: iconAccent }]}>
              <Invoice01Icon size={14} color={iconColor} variant="stroke" />
            </View>
            <View style={styles.taxInfo}>
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {customer.vergiNumarasi}
              </Text>
              <Text style={[styles.taxLabel, { color: colors.textMuted }]}>VKN</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const ErpCustomerCard = memo(ErpCustomerCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.6,
  },
  codeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  code: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    letterSpacing: 0.5,
  },
  erpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    shadowColor: "#ec4899",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  erpBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  taxInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taxLabel: {
    fontSize: 10,
    fontWeight: "800",
    opacity: 0.5,
  },
});