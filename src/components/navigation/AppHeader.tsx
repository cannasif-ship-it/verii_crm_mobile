import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Menu01Icon, UserIcon } from "hugeicons-react-native";
import { useUIStore } from "../../store/ui";
import { useAuthStore } from "../../store/auth";
import { GRADIENT } from "../../constants/theme";
import ProfilePanel from "./ProfilePanel";

export function AppHeader(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Get theme colors and mode
  const { colors, openSidebar, themeMode } = useUIStore();
  const { user, branch, clearAuth } = useAuthStore(); 

  const isDark = themeMode === "dark";

  // Define dynamic styles based on theme
  const THEME = {
    bg: isDark ? "#0f0518" : colors.card, // Dark purple for dark mode, card color for light
    border: isDark ? "rgba(255, 255, 255, 0.1)" : colors.border,
    iconColor: isDark ? "#E2E8F0" : colors.text, // Light icons for dark mode, dark icons for light
    buttonBg: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
    avatarInnerBg: isDark ? "#0f0518" : colors.background,
  };

  const [isProfileOpen, setProfileOpen] = useState(false);

  const handleProfilePress = () => {
    setProfileOpen(true);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    if (clearAuth) clearAuth();
    router.replace("/login" as never);
  };

  return (
    <>
      <View 
        style={[
          styles.container, 
          { 
            backgroundColor: THEME.bg,
            paddingTop: insets.top + 10,
            borderBottomColor: THEME.border,
          }
        ]}
      >
        {/* Left: Menu Button */}
        <View style={styles.leftContainer}>
          <TouchableOpacity 
            onPress={openSidebar} 
            style={[styles.iconButton, { backgroundColor: THEME.buttonBg }]}
            activeOpacity={0.7}
          >
            <Menu01Icon size={24} color={THEME.iconColor} />
          </TouchableOpacity>
        </View>

        {/* Center: Spacer (Title removed as per original design) */}
        <View style={styles.centerContainer} pointerEvents="none" />

        {/* Right: Profile Avatar */}
        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
            <LinearGradient
              colors={[...GRADIENT.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarBorder}
            >
              <View style={[styles.avatarInner, { backgroundColor: THEME.avatarInnerBg }]}>
                <UserIcon size={20} color={THEME.iconColor} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ProfilePanel 
        isOpen={isProfileOpen} 
        onClose={() => setProfileOpen(false)}
        userName={user?.name || "Kullanıcı"}
        email={user?.email}
        branch={branch?.name}
        onLogout={handleLogout}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 50,
    // Shadow logic mostly applies to light mode or elevated dark surfaces
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 80, 
  },
  leftContainer: {
    flex: 1,
    alignItems: "flex-start",
    zIndex: 20,
  },
  rightContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 20,
  },
  centerContainer: {
    flex: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    // Background color is handled in component
  },
  avatarBorder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 2, 
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    // Background color is handled in component
  },
});