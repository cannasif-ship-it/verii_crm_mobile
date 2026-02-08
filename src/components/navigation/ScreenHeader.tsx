import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../ui/text"; 
import { useUIStore } from "../../store/ui"; 
import { ArrowLeft02Icon, Menu01Icon } from "hugeicons-react-native";

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function ScreenHeader({
  title,
  showBackButton = true,
  rightElement,
  rightContent,
}: ScreenHeaderProps): React.ReactElement {
  const right = rightElement ?? rightContent;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Store'dan verileri çekiyoruz (as any ile hatayı susturduk)
  const { colors, themeMode, openSidebar } = useUIStore() as any;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  // --- RENK AYARI (Sidebar ile aynı olsun) ---
  const isDark = themeMode === "dark";
  
  // Karanlık modda direkt Sidebar'ın rengini (#0f0518 -> colors.header) alıyoruz.
  // Aydınlık modda temiz beyaz (#FFFFFF).
  const headerBg = isDark ? (colors?.header || "#0f0518") : "#FFFFFF";
  
  // Yazı rengi
  const textColor = colors?.text || "#000";
  
  // Alt Çizgi Rengi (Belirgin olsun)
  const borderColor = isDark ? "rgba(255, 255, 255, 0.15)" : "#E5E7EB";

  // Buton arkası (Çok hafif)
  const buttonBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)";

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top,
          backgroundColor: headerBg,
          borderBottomColor: borderColor, 
        }
      ]}
    >
      <View style={styles.content}>
        {/* SOL BUTON (KÜÇÜLTÜLDÜ) */}
        <TouchableOpacity
          onPress={showBackButton ? handleBack : openSidebar}
          style={[styles.iconButton, { backgroundColor: buttonBg }]}
          activeOpacity={0.7}
        >
          {showBackButton ? (
            <ArrowLeft02Icon size={18} color={textColor} strokeWidth={2.5} />
          ) : (
            <Menu01Icon size={18} color={textColor} strokeWidth={2.5} />
          )}
        </TouchableOpacity>

        {/* ORTA BAŞLIK (KÜÇÜLTÜLDÜ) */}
        <Text 
          style={[styles.title, { color: textColor }]} 
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* SAĞ TARAF */}
        <View style={styles.rightContainer}>
          {right ? right : <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    // Border belirgin olsun (1px)
    borderBottomWidth: 1, 
    zIndex: 10,
    elevation: 0, 
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    // YÜKSEKLİK: 40px (Çok kısa, Text kadar)
    height: 20, 
    marginBottom: 20,
  },
  iconButton: {
    // Buton boyutu minik
    width: 30,
    height: 30,
    borderRadius: 8, 
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14, // Font küçüldü (Kibar durur)
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  rightContainer: {
    minWidth: 30,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  placeholder: { 
    width: 30 
  },
});