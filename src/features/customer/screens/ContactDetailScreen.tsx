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
import { useContact, useDeleteContact } from "../hooks";

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

export function ContactDetailScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, themeMode } = useUIStore();
  const insets = useSafeAreaInsets();

  const [isDeleting, setIsDeleting] = useState(false);

  const contentBackground = themeMode === "dark" ? "rgba(20, 10, 30, 0.5)" : colors.background;

  const contactId = id ? Number(id) : undefined;
  const { data: contact, isLoading, isError, refetch } = useContact(contactId);
  const deleteContact = useDeleteContact();

  const handleEditPress = useCallback(() => {
    if (contact) {
      router.push(`/(tabs)/customers/contacts/edit/${contact.id}`);
    }
  }, [router, contact]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(t("common.confirm"), t("contact.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (!contactId) return;
          setIsDeleting(true);
          try {
            await deleteContact.mutateAsync(contactId);
            router.back();
          } catch {
            Alert.alert(t("common.error"), t("common.error"));
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }, [t, contactId, deleteContact, router]);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header }]}>
        <ScreenHeader
          title={t("contact.detail")}
          showBackButton
          rightContent={
            contact ? (
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
          ) : contact ? (
            <>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {contact.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.nameContainer}>
                    <Text style={[styles.contactName, { color: colors.text }]}>
                      {contact.fullName}
                    </Text>
                    {contact.titleName && (
                      <Text style={[styles.titleName, { color: colors.textMuted }]}>
                        {contact.titleName}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {contact.customerName && (
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("contact.customer")}
                  </Text>
                  <View style={[styles.customerBadge, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={styles.customerIcon}>🏢</Text>
                    <Text style={[styles.customerName, { color: colors.textSecondary }]}>
                      {contact.customerName}
                    </Text>
                  </View>
                </View>
              )}

              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t("contact.phone")} & {t("contact.email")}
                </Text>
                <DetailRow label={t("contact.phone")} value={contact.phone} colors={colors} />
                <DetailRow label={t("contact.mobile")} value={contact.mobile} colors={colors} />
                <DetailRow label={t("contact.email")} value={contact.email} colors={colors} />
              </View>

              {contact.notes && (
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t("contact.notes")}
                  </Text>
                  <Text style={[styles.notes, { color: colors.textSecondary }]}>{contact.notes}</Text>
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
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(236, 72, 153, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ec4899",
  },
  nameContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 20,
    fontWeight: "600",
  },
  titleName: {
    fontSize: 14,
    marginTop: 2,
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
