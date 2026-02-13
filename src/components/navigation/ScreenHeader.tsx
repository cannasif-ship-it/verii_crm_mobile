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
  
  const { themeMode, openSidebar } = useUIStore() as any;
  const isDark = themeMode === "dark";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const gradientColors = isDark 
    ? ['#1a1625', '#0c0516'] 
    : ['#ffffff', '#f3f4f6'];

  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

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
        <View style={[styles.leftBox, { borderRightColor: borderColor }]}>
          <Pressable
            onPress={showBackButton ? handleBack : openSidebar}
            style={({ pressed }) => [
              styles.iconButton, 
              { 
                backgroundColor: pressed ? "rgba(239, 68, 68, 0.15)" : "transparent",
              }
            ]}
          >
            {({ pressed }) => (
               showBackButton ? (
                <ArrowLeft02Icon 
                  size={20} 
                  color={pressed ? "#EF4444" : textColor} 
                  strokeWidth={2.5} 
                />
              ) : (
                <Menu01Icon 
                  size={20} 
                  color={pressed ? "#EF4444" : textColor} 
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

        {rightElement && (
           <View style={[styles.rightAbsolute, { borderLeftColor: borderColor }]}>
             {rightElement}
           </View>
        )}
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
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  row: {
    flexDirection: "row",
    height: 44, 
    alignItems: "stretch", 
  },
  leftBox: {
    width: 50, 
    borderRightWidth: 1, 
    justifyContent: "center",
    alignItems: "center",
  },
  centerBox: {
    flex: 1, 
    justifyContent: "center",
    alignItems: "center", 
    paddingHorizontal: 16,
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
  rightAbsolute: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
  },
});