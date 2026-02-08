import React, { memo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { StockGetDto } from "../types";

// İkonlar
import { 
  PackageIcon,      
  CubeIcon,       
  BarCode01Icon,      
  Factory02Icon 
} from "hugeicons-react-native";

interface StockCardProps {
  stock: StockGetDto;
  onPress: () => void;
}

function StockCardComponent({ stock, onPress }: StockCardProps): React.ReactElement {
  const { colors, themeMode } = useUIStore() as any;
  const isDark = themeMode === "dark";
  
  const [isPressed, setIsPressed] = useState(false);
  const THEME_PINK = "#ec4899"; 

  // --- RENK AYARLARI (CONTRAST) ---
  // Kart rengini arka plandan ayırıyoruz.
  // Dark Mod: Kartlar biraz daha açık (Slate-800 gibi), Zemin simsiyah.
  const cardBg = isDark ? "#1E293B" : "#FFFFFF"; 
  const borderColor = isPressed ? THEME_PINK : (isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0");
  
  const titleColor = isDark ? "#F8FAFC" : "#111827";
  const subTextColor = isDark ? "#94A3B8" : "#64748B";

  // İkon Kutusu
  const iconBoxBg = isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: cardBg, 
          borderColor: borderColor,
          borderWidth: isPressed ? 1.5 : 1, // Basınca kalınlaşan çerçeve
          // GÖLGE VE DERİNLİK
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 6,
          elevation: 3,
          // Basınca ufak bir küçülme efekti (Mobile hissi)
          transform: [{ scale: pressed ? 0.98 : 1 }]
        },
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <View style={styles.mainRow}>
        
        {/* SOL: İKON KUTUSU */}
        <View style={[styles.iconBox, { backgroundColor: isPressed ? "rgba(236,72,153,0.15)" : iconBoxBg }]}>
          <PackageIcon 
            size={24} 
            color={isPressed ? THEME_PINK : (isDark ? "#CBD5E1" : "#64748B")} 
            variant="stroke" 
          />
        </View>

        {/* ORTA: BİLGİLER */}
        <View style={styles.infoContainer}>
          {/* Stok Adı (AD etiketi olmadan, net başlık) */}
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={2}>
            {stock.stockName || "İsimsiz Stok"}
          </Text>
          
          {/* Kod Alanı (Barkod ikonu ile) */}
          <View style={styles.codeRow}>
            <BarCode01Icon size={14} color={subTextColor} />
            <Text style={[styles.codeText, { color: subTextColor }]}>
              {stock.erpStockCode || "Kod Yok"}
            </Text>
          </View>
        </View>
      </View>

      {/* ALT: ETİKETLER (Çizgi ile ayrılmış detay alanı) */}
      {(stock.unit || stock.ureticiKodu) && (
        <View style={[styles.footer, { borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }]}>
          {stock.unit && (
            <View style={styles.badge}>
              <CubeIcon size={12} color={subTextColor} />
              <Text style={[styles.badgeText, { color: subTextColor }]}>{stock.unit}</Text>
            </View>
          )}
          {stock.ureticiKodu && (
            <View style={styles.badge}>
              <Factory02Icon size={12} color={subTextColor} />
              <Text style={[styles.badgeText, { color: subTextColor }]}>{stock.ureticiKodu}</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

export const StockCard = memo(StockCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16, 
    marginBottom: 16, // KARTLAR ARASI NET BOŞLUK
    borderWidth: 1,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12, 
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 20,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  codeText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "monospace", // Kod olduğu belli olsun diye
  },
  footer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
});