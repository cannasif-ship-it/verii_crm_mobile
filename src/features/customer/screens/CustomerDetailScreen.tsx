import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
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
import { useCustomer, useDeleteCustomer } from "../hooks";
import { CustomerDetailContent } from "../components/CustomerDetailContent";
// İKONLAR (Emoji yerine)
import { Edit02Icon, Delete02Icon } from "hugeicons-react-native";

export function CustomerDetailScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useUIStore(); 
  const insets = useSafeAreaInsets();

  const [isDeleting, setIsDeleting] = useState(false);

  // --- TEMA (SABİT DEEP PURPLE) ---
  const THEME = {
    bg: "#1a0b2e", // Ana Arka Plan
    headerButtonBg: "rgba(255, 255, 255, 0.1)", 
    text: "#FFFFFF",
    primary: "#db2777", // Pembe Vurgu
    error: "#ef4444",
    borderColor: "rgba(255,255,255,0.05)"
  };

  const customerId = id ? Number(id) : undefined;
  const { data: customer, isLoading, isError, refetch } = useCustomer(customerId);
  const deleteCustomer = useDeleteCustomer();

  const handleEditPress = useCallback(() => {
    if (customer) {
      router.push(`/(tabs)/customers/edit/${customer.id}`);
    }
  }, [router, customer]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(t("common.confirm"), t("customer.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          if (!customerId) return;
          setIsDeleting(true);
          try {
            await deleteCustomer.mutateAsync(customerId);
            router.back();
          } catch {
            Alert.alert(t("common.error"), t("common.error"));
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }, [t, customerId, deleteCustomer, router]);

  return (
    <>
      <StatusBar style="light" backgroundColor={THEME.bg} />
      
      {/* Container Arka Planı Güncellendi */}
      <View style={[styles.container, { backgroundColor: THEME.bg }]}>
        
        {/* Header Stili */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: THEME.borderColor }}>
            <ScreenHeader
              title={t("customer.detail")}
              showBackButton
              rightElement={
                customer ? (
                  <View style={styles.headerActions}>
                    {/* DÜZENLE BUTONU */}
                    <TouchableOpacity onPress={handleEditPress} style={[styles.headerButton, { backgroundColor: THEME.headerButtonBg }]}>
                      <Edit02Icon size={20} color="#FFFFFF" variant="stroke" />
                    </TouchableOpacity>
                    
                    {/* SİL BUTONU */}
                    <TouchableOpacity
                      onPress={handleDeletePress}
                      style={[styles.headerButton, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]} 
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Delete02Icon size={20} color="#ef4444" variant="stroke" />
                      )}
                    </TouchableOpacity>
                  </View>
                ) : undefined
              }
            />
        </View>

        {/* İçerik Alanı */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: THEME.error }]}>{t("common.error")}</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: THEME.primary }]}>{t("common.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : customer ? (
            <CustomerDetailContent
              customer={customer}
              colors={colors} 
              insets={insets}
              t={t}
            />
          ) : null}
        </View>
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
    // Eski yuvarlak köşeleri kaldırdık, tam ekran bütünlüğü için
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
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12, 
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12, 
    alignItems: "center",
    justifyContent: "center",
  },
});