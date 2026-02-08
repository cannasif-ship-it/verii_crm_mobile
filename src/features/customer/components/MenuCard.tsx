import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text"; // Yolunuz farklıysa düzeltin
import { useUIStore } from "../../../store/ui"; // Yolunuz farklıysa düzeltin

interface MenuCardProps {
  title: string;
  description: string;
  // Hem String (Emoji) hem Component (SVG) alabilsin
  icon: React.ReactNode; 
  onPress: () => void;
  // HATA ÇÖZÜMÜ: Burayı eklemeyi unutmuşuz, şimdi ekledik.
  rightIcon?: React.ReactNode; 
}

export function MenuCard({ 
  title, 
  description, 
  icon, 
  onPress, 
  rightIcon // Props'tan alıyoruz
}: MenuCardProps): React.ReactElement {
  
  const { colors, themeMode } = useUIStore() as any;
  const isDark = themeMode === "dark";

  // --- TIKLAMA DURUMU (WOW EFEKTİ) ---
  const [isPressed, setIsPressed] = useState(false);

  // --- RENKLER ---
  const ACTIVE_PINK = "#ec4899"; // Neon Pembe

  // 1. ZEMİN RENGİ
  const cardBg = isDark ? (colors?.card || "#1E293B") : "#FFFFFF";

  // 2. BORDER (ÇERÇEVE)
  const normalBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
  const currentBorder = isPressed ? ACTIVE_PINK : normalBorder;

  // 3. İKON KUTUSU ARKAPLANI
  const normalIconBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(232, 72, 85, 0.1)";
  const pressedIconBg = isDark ? "rgba(236, 72, 153, 0.2)" : "rgba(236, 72, 153, 0.15)";
  const currentIconBg = isPressed ? pressedIconBg : normalIconBg;

  // 4. METİN RENKLERİ
  const titleColor = isPressed ? ACTIVE_PINK : (isDark ? "#FFFFFF" : colors.text);
  const descColor = isDark ? "#94A3B8" : colors.textSecondary;
  const arrowColor = isPressed ? ACTIVE_PINK : (isDark ? "#64748B" : "#9CA3AF");

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: cardBg, 
          borderColor: currentBorder,
          // Basınca çizgi hafif kalınlaşsın
          borderWidth: isPressed ? 1.5 : 1,
          // Gölge
          shadowColor: isPressed ? ACTIVE_PINK : (isDark ? "#000" : "#64748B"),
          shadowOpacity: isDark ? 0.3 : 0.08,
        },
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.9}
    >
      {/* İKON KUTUSU */}
  <View style={[styles.iconContainer, { backgroundColor: currentIconBg }]}>
        {React.isValidElement(icon) ? (
          // DÜZELTME: variant değiştirmeyi kaldırdık, sadece renk değişecek.
          React.cloneElement(icon as React.ReactElement<any>, {
            color: isPressed ? ACTIVE_PINK : (isDark ? "#FFFFFF" : "#111827"), // Renk değişimi
            // variant: "stroke", // Eğer kütüphane zorunlu kılıyorsa bunu sabit bırak
            // strokeWidth: 1.5 // İstersen kalınlığı sabit tut
          })
        ) : (
          // Eğer Emoji/String ise
          <Text style={[styles.icon, { color: isPressed ? ACTIVE_PINK : undefined }]}>
            {icon}
          </Text>
        )}
      </View>

      {/* İÇERİK */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: titleColor }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: descColor }]}>
          {description}
        </Text>
      </View>

      {/* SAĞ TARAF (rightIcon varsa onu göster, yoksa varsayılan ok) */}
      <View style={styles.rightContainer}>
        {rightIcon ? (
          rightIcon
        ) : (
          <Text style={[styles.arrow, { color: arrowColor }]}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    // Gölge ayarları
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  rightContainer: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 24,
  },
  arrow: {
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30, 
  },
});