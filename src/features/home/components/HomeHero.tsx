import React from "react";
import { View, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../../../components/ui/text";
import { Rocket01Icon } from "hugeicons-react-native";

// Web referansındaki renklere yakın gradientler
const HERO_GRADIENT = ["#2563EB", "#1E40AF"] as const; // Klasik Mavi Kurumsal

interface HomeHeroProps {
  themeMode: "light" | "dark";
}

export function HomeHero({ themeMode }: HomeHeroProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[...HERO_GRADIENT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ 
          borderRadius: 24, 
          padding: 22, 
          marginBottom: 24,
          shadowColor: "#2563EB",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8 
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            {t("home.appName", "V3RII CRM")}
          </Text>
          <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "800", lineHeight: 30 }}>
            {t("home.tagline", "İşinize odaklanın, gerisini bize bırakın.")}
          </Text>
        </View>
        <View style={{ 
            width: 52, 
            height: 52, 
            borderRadius: 16, 
            backgroundColor: "rgba(255,255,255,0.15)", 
            alignItems: "center", 
            justifyContent: "center", 
            borderWidth: 1, 
            borderColor: "rgba(255,255,255,0.2)" 
        }}>
          <Rocket01Icon size={26} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      </View>
    </LinearGradient>
  );
}