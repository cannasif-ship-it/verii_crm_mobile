import React, { useState } from "react"; // 1. useState'i import ettik
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { ArrowRight01Icon } from "hugeicons-react-native";

interface MenuCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  rightIcon?: React.ReactNode;
}

export function MenuCard({
  title,
  description,
  icon,
  onPress,
  rightIcon
}: MenuCardProps): React.ReactElement {
  // Store'dan verileri çekiyoruz
  const { colors, themeMode } = useUIStore() as any;
  const isDark = themeMode === "dark";

  // 2. Basılma durumunu takip etmek için bir state oluşturuyoruz
  const [isPressed, setIsPressed] = useState(false);

  // --- RENKLER ---
  const ACTIVE_PINK = "#ec4899"; // Neon Pembe (Tıklanınca)

  // Arka Plan Rengi (Senin kodundaki gibi)
  const cardBg = isDark ? (colors?.card || "#1E293B") : "#FFFFFF";

  // Çerçeve Rengi (Border)
  // Normalde: Hafif gri/şeffaf
  // Basınca: NEON PEMBE
  const normalBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
  const currentBorder = isPressed ? ACTIVE_PINK : normalBorder;

  // İkon Kutusu Arka Planı (Senin kodundaki gibi)
  const iconBoxBg = isDark ? "rgba(236, 72, 153, 0.15)" : "#FFF0F5";

  // İkon Rengi
  // Normalde: Store'dan gelen metin rengi (veya varsayılan)
  // Basınca: NEON PEMBE
  const normalIconColor = colors?.text || (isDark ? "#FFFFFF" : "#000000");
  const currentIconColor = isPressed ? ACTIVE_PINK : normalIconColor;

  // Diğer Metin Renkleri (Senin kodundaki gibi)
  const titleColor = isDark ? "#F8FAFC" : "#111827";
  const descColor = isDark ? "#94A3B8" : "#6B7280";
  const arrowColor = isDark ? "#F472B6" : "#9CA3AF";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: currentBorder, // 3. Dinamik çerçeve rengi
          shadowColor: isDark ? "#000" : "#64748B",
          shadowOpacity: isDark ? 0.3 : 0.08,
        },
      ]}
      onPress={onPress}
      // 4. Basılma durumunu güncelliyoruz
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      // 5. Opaklığı artırdık ki renk değişimi daha net görünsün
      activeOpacity={0.9}
    >
      {/* Sol İkon Kutusu */}
      <View style={[
        styles.iconContainer,
        { backgroundColor: iconBoxBg }
      ]}>
        {/* 6. İkonun rengini duruma göre değiştiriyoruz */}
        {React.isValidElement(icon) ? (
          React.cloneElement(icon as React.ReactElement<any>, {
            color: currentIconColor, // Basınca pembe, normalde kendi rengi
            variant: "stroke"
          })
        ) : (
          icon
        )}
      </View>

      {/* Orta Yazı Alanı (YAPI BOZULMAZ) */}
      <View style={styles.content}>
        <Text
            style={[styles.title, { color: titleColor }]}
            numberOfLines={1}
        >
          {title}
        </Text>
        <Text
            style={[styles.description, { color: descColor }]}
            numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      {/* Sağ Taraf */}
      <View style={styles.rightContainer}>
        {rightIcon ? (
          rightIcon
        ) : (
          <ArrowRight01Icon
            size={20}
            color={arrowColor}
            variant="stroke"
            strokeWidth={2}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

// --- STİLLER (SENİN ÇALIŞAN KODUNUN AYNISI - DOKUNMADIM) ---
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    // Gölge
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  textIcon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    paddingRight: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  rightContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  }
});