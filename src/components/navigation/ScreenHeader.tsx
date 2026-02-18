import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../ui/text"; 
import { useUIStore } from "../../store/ui"; 
import { ArrowLeft02Icon, Menu01Icon } from "hugeicons-react-native";

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({
  title,
  showBackButton = true,
  rightElement,
}: ScreenHeaderProps): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { themeMode, colors, openSidebar } = useUIStore();
  const isDark = themeMode === "dark";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const gradientColors = isDark 
    ? ['#232032', '#12101F'] 
    : ['#FFFFFF', '#F1F5F9'];

  const textColor = colors.text;
  
  const borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
  const iconColor = isDark ? "#E2E8F0" : "#1E293B";

  return (
    <LinearGradient
      colors={gradientColors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }} 
      style={[
        styles.container, 
        { 
          height: 44 + insets.top,
          paddingTop: insets.top,
          marginTop: -insets.top, 
          borderBottomColor: borderColor, 
        }
      ]}
    >
      <View style={styles.row}>
        
        <View style={[styles.sideBox, { borderRightColor: borderColor, borderRightWidth: 1 }]}>
          <Pressable
            onPress={showBackButton ? handleBack : openSidebar}
            style={({ pressed }) => [
              styles.iconButton, 
              { 
                backgroundColor: pressed 
                  ? (isDark ? "rgba(219, 39, 119, 0.15)" : "rgba(219, 39, 119, 0.08)") 
                  : "transparent",
              }
            ]}
          >
            {({ pressed }) => (
               showBackButton ? (
                <ArrowLeft02Icon 
                  size={20} 
                  color={pressed ? "#db2777" : iconColor} 
                  strokeWidth={2.5} 
                />
              ) : (
                <Menu01Icon 
                  size={20} 
                  color={pressed ? "#db2777" : iconColor} 
                  strokeWidth={2.5} 
                />
              )
            )}
          </Pressable>
        </View>

        <View style={styles.centerBox}>
          <Text 
            style={[styles.title, { color: textColor }]} 
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        <View style={[
            styles.sideBox, 
            { 
              borderLeftColor: borderColor, 
              borderLeftWidth: rightElement ? 1 : 0 
            }
        ]}>
          {rightElement}
        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderBottomWidth: 1, 
    zIndex: 999,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, 
    shadowRadius: 16,    
  },
  row: {
    flexDirection: "row",
    height: 44, 
    alignItems: "stretch", 
  },
  sideBox: {
    width: 50, 
    justifyContent: "center",
    alignItems: "center",
  },
  centerBox: {
    flex: 1, 
    justifyContent: "center",
    alignItems: "center", 
    paddingHorizontal: 4, 
  },
  iconButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 15, 
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3, 
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  },
});