import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../ui/text";
import { useUIStore } from "../../store/ui"; // Store
// İkonlar
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
  
  // Store'dan renkleri ve Sidebar açma fonksiyonunu çekiyoruz
  const { colors, themeMode, openSidebar } = useUIStore();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleMenuPress = () => {
    // Eğer önceki adımlardaki Custom Sidebar'ı kullanıyorsan:
    openSidebar();
    
    // Eğer standart React Navigation Drawer kullanıyorsan bunu aç:
    // navigation.dispatch(DrawerActions.toggleDrawer());
  };

  // Buton arka plan rengi (Tema moduna göre hafif transparan)
  const buttonBgColor = themeMode === "dark" 
    ? "rgba(255, 255, 255, 0.1)" 
    : "rgba(0, 0, 0, 0.05)";

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top,
          backgroundColor: colors.card, // Temaya göre arka plan (Koyu veya Beyaz)
          borderBottomColor: colors.border, // Temaya göre çizgi rengi
        }
      ]}
    >
      <View style={styles.content}>
        {/* SOL BUTON: Geri Dön veya Menüyü Aç */}
        <TouchableOpacity
          onPress={showBackButton ? handleBack : handleMenuPress}
          style={[
            styles.backButton, 
            { 
              backgroundColor: buttonBgColor,
              borderColor: colors.border 
            }
          ]}
          activeOpacity={0.7}
        >
          {showBackButton ? (
            <ArrowLeft02Icon size={24} color={colors.text} strokeWidth={2} />
          ) : (
            <Menu01Icon size={24} color={colors.text} strokeWidth={2} />
          )}
        </TouchableOpacity>

        <Text 
          style={[styles.title, { color: colors.text }]} 
          numberOfLines={1}
        >
          {title}
        </Text>

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
    borderBottomWidth: 1,
    // Gölge ayarları (Light modda daha belirgin olması için korunabilir)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  placeholder: { width: 40, height: 40 },
  rightContainer: {
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});