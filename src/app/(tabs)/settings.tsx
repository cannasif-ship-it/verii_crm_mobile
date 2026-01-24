import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Text } from "../../components/ui/text";
import { useAuthStore } from "../../store/auth";
import { useUIStore } from "../../store/ui";
import { setLanguage, getCurrentLanguage } from "../../locales";

export default function SettingsScreen(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { colors, themeMode, toggleTheme } = useUIStore();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const isDarkMode = themeMode === "dark";

  const handleBack = (): void => {
    router.back();
  };

  const handleLanguageChange = async (lang: "tr" | "en"): Promise<void> => {
    await setLanguage(lang);
    setCurrentLang(lang);
  };

  const handleLogout = (): void => {
    Alert.alert(
      t("common.logout"),
      "",
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.logout"),
          style: "destructive",
          onPress: () => {
            clearAuth();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const cardBackground = isDarkMode ? "rgba(20, 10, 30, 0.7)" : "#FFFFFF";

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.header, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("common.settings")}</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={[styles.content, { backgroundColor: colors.background }]}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t("settings.appearance")}
            </Text>
            <View
              style={[
                styles.optionCard,
                { backgroundColor: cardBackground, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Text style={styles.optionIcon}>{isDarkMode ? "🌙" : "☀️"}</Text>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {t("settings.darkMode")}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: "#E5E7EB", true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t("language.title")}
            </Text>
            <View
              style={[
                styles.languageOptions,
                { backgroundColor: cardBackground, borderColor: colors.cardBorder },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  { borderBottomColor: colors.cardBorder },
                  currentLang === "tr" && { backgroundColor: colors.activeBackground },
                ]}
                onPress={() => handleLanguageChange("tr")}
              >
                <Text style={styles.languageFlag}>🇹🇷</Text>
                <Text
                  style={[
                    styles.languageText,
                    { color: colors.text },
                    currentLang === "tr" && { fontWeight: "600", color: colors.accent },
                  ]}
                >
                  {t("language.turkish")}
                </Text>
                {currentLang === "tr" && (
                  <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  { borderBottomWidth: 0 },
                  currentLang === "en" && { backgroundColor: colors.activeBackground },
                ]}
                onPress={() => handleLanguageChange("en")}
              >
                <Text style={styles.languageFlag}>🇬🇧</Text>
                <Text
                  style={[
                    styles.languageText,
                    { color: colors.text },
                    currentLang === "en" && { fontWeight: "600", color: colors.accent },
                  ]}
                >
                  {t("language.english")}
                </Text>
                {currentLang === "en" && (
                  <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#FFFFFF",
                borderColor: isDarkMode ? "rgba(239, 68, 68, 0.3)" : "#FEE2E2",
              },
            ]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { color: colors.error }]}>
              {t("common.logout")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
  },
  languageOptions: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    flex: 1,
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
