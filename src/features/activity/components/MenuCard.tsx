import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";

interface MenuCardProps {
  title: string;
  description: string;
  // Hem String (Emoji) hem Component (SVG) alabilsin
  icon: React.ReactNode; 
  onPress: () => void;
  // EKLENDİ: Artık sağ ikonu kabul ediyor
  rightIcon?: React.ReactNode;
}

export function MenuCard({ 
  title, 
  description, 
  icon, 
  onPress,
  rightIcon // EKLENDİ: Props'tan çekiyoruz
}: MenuCardProps): React.ReactElement {
  
  const { colors, themeMode } = useUIStore() as any; // Type hatası almamak için any
  
  // --- TIKLAMA DURUMU (WOW EFEKTİ) ---
  const [isPressed, setIsPressed] = useState(false);

  // --- RENKLER ---
  const ACTIVE_PINK = "#ec4899"; // Neon Pembe

  // 1. ZEMİN RENGİ
  const isDark = themeMode === "dark";
  const cardBg = colors.card; 

  // 2. BORDER (ÇERÇEVE)
  const normalBorder = colors.cardBorder;
  const currentBorder = isPressed ? ACTIVE_PINK : normalBorder;

  // 3. İKON KUTUSU ARKAPLANI
  const normalIconBg = "rgba(232, 72, 85, 0.1)";
  const pressedIconBg = "rgba(236, 72, 153, 0.15)";
  const currentIconBg = isPressed ? pressedIconBg : normalIconBg;

  // 4. METİN RENKLERİ
  const normalTitleColor = isDark ? "#FFFFFF" : colors.text;
  const normalDescColor = isDark ? "#E2E8F0" : colors.textSecondary;
  const normalArrowColor = isDark ? "#E2E8F0" : colors.textSecondary;

  // Basınca Başlık ve Ok PEMBE olsun
  const currentTitleColor = isPressed ? ACTIVE_PINK : normalTitleColor;
  const currentArrowColor = isPressed ? ACTIVE_PINK : normalArrowColor;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: cardBg, 
          borderColor: currentBorder,
          // Basınca çizgi hafif kalınlaşsın
          borderWidth: isPressed ? 1.5 : 1 
        },
      ]}
      onPress={onPress}
      // Tıklama olaylarını yakalıyoruz
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.7}
    >
      {/* İKON KUTUSU */}
      <View style={[styles.iconContainer, { backgroundColor: currentIconBg }]}>
        {/* SVG veya Emoji Kontrolü */}
        {React.isValidElement(icon) ? (
          React.cloneElement(icon as React.ReactElement<any>, {
            // SADECE RENK DEĞİŞTİRİYORUZ (Variant değiştirince ikon kaybolabiliyor)
            color: isPressed ? ACTIVE_PINK : (isDark ? "#FFFFFF" : colors.text),
            // variant: "stroke" // Varsayılan neyse o kalsın, zorlamıyoruz
          })
        ) : (
          <Text style={[styles.icon, { color: isPressed ? ACTIVE_PINK : undefined }]}>
            {icon}
          </Text>
        )}
      </View>

      {/* İÇERİK */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: currentTitleColor }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: normalDescColor }]}>
          {description}
        </Text>
      </View>

      {/* SAĞ TARAF (Right Icon veya Ok) */}
      <View style={styles.rightContainer}>
        {rightIcon ? (
          // Eğer dışarıdan sağ ikon gelirse (örn: HugeIcon oku)
          rightIcon
        ) : (
          // Gelmezse varsayılan Text ok
          <Text style={[styles.arrow, { color: currentArrowColor }]}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// --- STİLLER ---
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
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
  // Sağ tarafı ortalamak için container ekledik
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    fontWeight: "300",
  },
});