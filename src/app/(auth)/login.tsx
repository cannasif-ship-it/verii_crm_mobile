import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { VStack } from "../../components/ui/vstack";
import { Text } from "../../components/ui/text";
import { LoginForm } from "../../features/auth";
import { setLanguage, getCurrentLanguage } from "../../locales";

export default function LoginScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const toggleLanguage = async (): Promise<void> => {
    const newLang = currentLang === "tr" ? "en" : "tr";
    await setLanguage(newLang);
    setCurrentLang(newLang);
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.glowPink} />
        <View style={styles.glowOrange} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
              <View style={styles.headerTop}>
                <Image
                  source={require("../../../assets/veriicrmlogo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.langButton}
                  onPress={toggleLanguage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.langButtonText}>
                    {currentLang === "tr" ? "EN" : "TR"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subtitle}>CUSTOMER RELATIONSHIP MANAGEMENT</Text>
            </View>

            <View style={styles.cardContainer}>
              <View style={styles.card}>
                <VStack space="xl" className="w-full">
                  <VStack space="xs" className="items-center mb-2">
                    <LinearGradient
                      colors={["#ec4899", "#fb923c", "#facc15"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientTextContainer}
                    >
                      <Text style={styles.welcomeTitle}>
                        {t("auth.welcome")}
                      </Text>
                    </LinearGradient>
                    <Text style={styles.welcomeSubtitle}>
                      {t("auth.welcomeSubtitle")}
                    </Text>
                  </VStack>
                  <LoginForm />
                </VStack>
              </View>
            </View>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
              <Text style={styles.footerText}>v3rii CRM</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0518",
  },
  glowPink: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(236, 72, 153, 0.08)",
  },
  glowOrange: {
    position: "absolute",
    bottom: 100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(249, 115, 22, 0.06)",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: {
    width: 120,
    height: 50,
  },
  langButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  langButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  cardContainer: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "rgba(20, 10, 30, 0.7)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  gradientTextContainer: {
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#475569",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
});
