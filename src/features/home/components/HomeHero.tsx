import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../../../components/ui/text";

const GRADIENT_COLORS = ["#1E293B", "#334155", "#475569"] as const;

export function HomeHero(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[...GRADIENT_COLORS]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl overflow-hidden mb-6 px-5 py-5"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-white/90 text-[13px] font-medium mb-1 uppercase tracking-wider">
            {t("home.appName")}
          </Text>
          <Text className="text-white text-[18px] font-bold leading-snug">
            {t("home.tagline")}
          </Text>
        </View>
        <View className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center">
          <Text className="text-2xl">🚀</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
