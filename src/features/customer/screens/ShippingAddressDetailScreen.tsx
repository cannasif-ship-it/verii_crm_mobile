import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../../components/navigation";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useShippingAddress, useDeleteShippingAddress } from "../hooks";

interface DetailRowProps {
  label: string;
  value: string | undefined | null;
  colors: ReturnType<typeof useUIStore>["colors"];
}

function DetailRow({ label, value, colors }: DetailRowProps): React.ReactElement | null {
  if (!value) return null;

  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export function ShippingAddressDetailScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const [isDeleting, setIsDeleting] = useState(false);

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const addressId = id ? Number(id) : undefined;
  const { data: address, isLoading, isError, refetch } = useShippingAddress(addressId);
  const deleteAddress = useDeleteShippingAddress();

  const handleEditPress = useCallback(() => {
    if (address) {
      router.push(`/(tabs)/customers/shipping/edit/${address.id}`);
    }
  }, [router, address]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(t("common.confirm"), t("shippingAddress.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (!addressId) return;
          setIsDeleting(true);
          try {
            await deleteAddress.mutateAsync(addressId);
            router.back();
          } catch {
            Alert.alert(t("common.error"), t("common.error"));
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }, [t, addressId, deleteAddress, router]);

  const locationParts: string[] = [];
  if (address?.countryName) locationParts.push(address.countryName);
  if (address?.cityName) locationParts.push(address.cityName);
  if (address?.districtName) locationParts.push(address.districtName);
  const location = locationParts.join(", ");

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={t("shippingAddress.detail")}
          showBackButton
          rightContent={
            address ? (
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleEditPress} style={styles.headerButton}>
                  <Text style={styles.headerButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeletePress}
                  style={styles.headerButton}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.headerButtonText}>🗑️</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : undefined
          }
        />
        <ScrollView
          style={[styles.content, { backgroundColor: contentBackground }]}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>{t("common.error")}</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: colors.accent }]}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : address ? (
            <>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>📍</Text>
                  </View>
                  <View style={styles.addressContainer}>
                    <Text style={[styles.addressText, { color: colors.text }]}>
                      {address.address}
                    </Text>
                    {location && (
                      <Text style={[styles.location, { color: colors.textMuted }]}>{location}</Text>
                    )}
                  </View>
                  {address.isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                      <Text style={[styles.activeBadgeText, { color: colors.success }]}>
                        {t("shippingAddress.isActive")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {address.customerName && (
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("shippingAddress.customer")}
                  </Text>
                  <View style={[styles.customerBadge, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={styles.customerIcon}>🏢</Text>
                    <Text style={[styles.customerName, { color: colors.textSecondary }]}>
                      {address.customerName}
                    </Text>
                  </View>
                </View>
              )}

              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t("shippingAddress.contactPerson")} & {t("shippingAddress.phone")}
                </Text>
                <DetailRow
                  label={t("shippingAddress.contactPerson")}
                  value={address.contactPerson}
                  colors={colors}
                />
                <DetailRow label={t("shippingAddress.phone")} value={address.phone} colors={colors} />
                <DetailRow
                  label={t("shippingAddress.postalCode")}
                  value={address.postalCode}
                  colors={colors}
                />
              </View>

              {address.notes && (
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("shippingAddress.notes")}
                  </Text>
                  <Text style={[styles.notes, { color: colors.textSecondary }]}>{address.notes}</Text>
                </View>
              )}
            </>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  addressContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  location: {
    fontSize: 14,
    marginTop: 4,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  customerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  customerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  customerName: {
    fontSize: 15,
    flex: 1,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
  },
  notes: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonText: {
    fontSize: 16,
  },
});
