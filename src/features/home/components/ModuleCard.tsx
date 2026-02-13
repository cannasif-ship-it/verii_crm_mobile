import React, { useState } from "react";
import { TouchableWithoutFeedback, View, StyleSheet, Platform, Animated } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { Module } from "../types";
import {
  UserIcon,        // Müşteriler
  Calendar02Icon,    // Aktiviteler
  SaleTag01Icon,     // Satış
  CubeIcon,        // Stok
  PackageIcon,       // Yedek
} from "hugeicons-react-native";

// YENİ İKON SETİ
const MODULE_ICONS: Record<string, React.ElementType> = {
  customers: UserIcon,
  activities: Calendar02Icon,
  sales: SaleTag01Icon,
  stock: CubeIcon, 
};

interface ModuleCardProps {
  item: Module;
  onPress: (route: string) => void;
}

export function ModuleCard({ item, onPress }: ModuleCardProps): React.ReactElement {
  const { t } = useTranslation();
  const { themeMode } = useUIStore();
  const [isPressed, setIsPressed] = useState(false);
  
  const Icon = MODULE_ICONS[item.key] ?? PackageIcon;
  const isDark = themeMode === "dark";

  // Renk Paleti
  const darkGradient = ["#161229", "#0F0B1E"] as const; 
  const lightBg = "#FFFFFF";

  // Border Rengi: Basılıyken Pembe, Değilse Standart
  const activeBorderColor = "#EC4899";
  const defaultBorderColor = isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9";
  const currentBorderColor = isPressed ? activeBorderColor : defaultBorderColor;
  
  // İkon Arkaplanı
  const iconBg = isDark ? "rgba(255,255,255,0.06)" : item.color + "10";

  // İçerik Yapısı (Ortalanmış, Oksuz)
  const Content = (
    <View style={styles.centerContent}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon size={30} color={item.color} strokeWidth={2} />
      </View>
      
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: isDark ? "#F8FAFC" : "#1E293B" }]}>
            {t(`modules.${item.key}`)}
        </Text>
        <Text style={[styles.desc, { color: isDark ? "#94A3B8" : "#64748B" }]} numberOfLines={2}>
            {t(`modules.${item.key}Desc`)}
        </Text>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => onPress(item.route)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <View
        style={[
          styles.cardContainer,
          {
             borderColor: currentBorderColor,
             backgroundColor: isDark ? "transparent" : lightBg,
             // Basıldığında hafif küçülme efekti (Scale)
             transform: [{ scale: isPressed ? 0.98 : 1 }], 
          }
        ]}
      >
        {isDark ? (
          <LinearGradient
            colors={[...darkGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBg}
          >
            {Content}
          </LinearGradient>
        ) : (
          <View style={styles.plainBg}>{Content}</View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    minHeight: 180, // Kart boyu biraz daha artırıldı, ferahlık için
    borderWidth: 1.5,
    borderRadius: 24, 
    marginBottom: 16,
    // Android Gölge
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  gradientBg: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plainBg: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconWrap: {
    width: 60, 
    height: 60,
    borderRadius: 20, // Daha yuvarlak hatlar
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  textWrap: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700", 
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }), 
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: "400",
  },
});