import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // Router eklendi
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Insets eklendi
import { Menu01Icon, Settings01Icon } from "hugeicons-react-native";
import { Text } from "../ui/text";
import { useUIStore } from "../../store/ui";
import { useAuthStore } from "../../store/auth";
import { GRADIENT } from "../../constants/theme";

export function AppHeader(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Store bağlantıları
  const { colors, openSidebar } = useUIStore();
  const { user, branch } = useAuthStore(); // User ve Branch buradan geliyor

  const getInitials = (name: string): string => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSettingsPress = () => {
    router.push("/settings" as never); // Ayarlara git
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.header || "#140a1e", // Header rengi
          paddingTop: insets.top + 10, // Status bar boşluğu + biraz pay
        }
      ]}
    >
      <View style={styles.left}>
        {/* Menü Butonu */}
        <TouchableOpacity 
          onPress={openSidebar} 
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Menu01Icon size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Avatar */}
        <LinearGradient
          colors={[...GRADIENT.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {user?.name ? getInitials(user.name) : "??"}
          </Text>
        </LinearGradient>

        {/* Bilgi Alanı */}
        <View style={styles.info}>
          <Text style={styles.greeting}>
            {t("home.greeting", "Merhaba")}, {user?.name?.split(" ")[0] || "Misafir"}
          </Text>
          <Text style={[styles.branch, { color: "rgba(255,255,255,0.7)" }]}>
            {branch ? `${branch.code} - ${branch.name}` : t("home.branch", "Şube Seçilmedi")}
          </Text>
        </View>
      </View>

      {/* Ayarlar Butonu */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={handleSettingsPress}
        activeOpacity={0.7}
      >
        <Settings01Icon size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    // Gölge ekleyelim ki alttaki içerikten ayrılsın
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 50, // En üstte kalması için
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // İsmin uzun olması durumunda ayarlar butonunu sıkıştırmasın
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  info: {
    justifyContent: "center",
    flex: 1, 
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  branch: {
    fontSize: 12,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});