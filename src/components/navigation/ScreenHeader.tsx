import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../ui/text";
import { useUIStore } from "../../store/ui";
// HugeIcons - Geri butonu için modern ikon
import { ArrowLeft02Icon } from "hugeicons-react-native";

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
  // Store'dan renkleri alıyoruz ama CRM tasarımı için override edeceğiz
  const { colors } = useUIStore(); 

  const handleBack = (): void => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top,
          // BottomNav ile aynı koyu tema rengi
          backgroundColor: "#140a1e", 
        }
      ]}
    >
      <View style={styles.content}>
        {/* SOL TARA (GERİ BUTONU) */}
        {showBackButton ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            {/* Metin oku yerine HugeIcon kullandık */}
            <ArrowLeft02Icon size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* ORTA (BAŞLIK) */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* SAĞ TARAF (OPSİYONEL İÇERİK) */}
        {right ? (
          <View style={styles.rightContainer}>{right}</View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    // Header'ın altını içerikten ayırmak için çok hafif çizgi ve gölge
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4, // Android gölgesi
    zIndex: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12, // Dikey boşluğu biraz optimize ettim
    height: 60, // Standart bir header yüksekliği
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12, // Tam yuvarlak yerine hafif kare (Squircle) daha modern durur
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Cam efekti
    alignItems: "center",
    justifyContent: "center",
    // Butona hafif border ekledik
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10, // Başlık uzunsa butonlara yapışmasın
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  rightContainer: {
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});