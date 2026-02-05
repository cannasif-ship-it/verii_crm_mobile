import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { SvgProps } from "react-native-svg";

interface ModuleCardProps {
  title: string;
  description: string;
  // İkonu bileşen olarak alıyoruz
  icon: React.FC<SvgProps & { size?: number; color?: string; variant?: "solid" | "stroke" | "duotone" }>;
  color: string;
  onPress: () => void;
}

export function ModuleCard({ title, description, icon: Icon, color, onPress }: ModuleCardProps) {
  const { colors, themeMode } = useUIStore();

  // İkon arka plan rengi (Opaklık ayarlı)
  const iconBgColor = themeMode === "dark" ? `${color}25` : `${color}15`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border, // cardBorder yerine border kullanıyoruz
          shadowColor: themeMode === "dark" ? "#000" : "#000",
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        {/* İkonu burada render ediyoruz */}
        <Icon size={28} color={color} variant="solid" />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%", // Grid yapısı için genişlik
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 140,
    borderWidth: 1,
    // Hafif gölge
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
});