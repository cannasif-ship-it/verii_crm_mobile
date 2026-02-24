import React from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text"; // Kendi Text bileşeninin yolu
import { ScreenHeader } from "../../../components/navigation"; // Kendi Header bileşeninin yolu
import { useUIStore } from "../../../store/ui";
import { Location01Icon, Time02Icon } from "hugeicons-react-native";

export default function ComingSoonScreen(): React.ReactElement {
  const { t } = useTranslation();
  const { themeMode, colors } = useUIStore();
  const isDark = themeMode === "dark";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Kullanıcı geri dönebilsin diye Header koyuyoruz */}
      <ScreenHeader
        title={t("rota.title") || "Rota"}
        showBackButton
      />

      <View style={styles.centered}>
        <View style={[styles.iconBox, { backgroundColor: isDark ? "rgba(236, 72, 153, 0.1)" : "#FDF2F8" }]}>
          <Time02Icon size={56} color="#ec4899" variant="stroke" />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Çok Yakında!
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Müşterileriniz için en ideal rotaları oluşturabileceğiniz harita ekranı çok yakında hizmetinizde olacak.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: -50, // Ortalamayı biraz yukarı çekmek için
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 32, // Hafif köşeli modern görünüm
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});