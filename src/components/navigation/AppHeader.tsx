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
  
  const { colors, openSidebar } = useUIStore();
  const { user, branch, clearAuth } = useAuthStore(); 

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
            backgroundColor: colors.header || "#0f0518",
            paddingTop: insets.top + 10,
            borderBottomColor: colors.border || "rgba(255, 255, 255, 0.1)",
          }
        ]}
      >
        <View style={styles.leftContainer}>
          <TouchableOpacity 
            onPress={openSidebar} 
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Menu01Icon size={24} color="#E2E8F0" />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer} pointerEvents="none" />

        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
            <LinearGradient
              colors={[...GRADIENT.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarBorder}
            >
              <View style={[styles.avatarInner, { backgroundColor: colors.header || "#0f0518" }]}>
                <UserIcon size={20} color="#E2E8F0" />
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
  },
});