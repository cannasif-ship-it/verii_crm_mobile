import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import {
  Cancel01Icon,
  Settings02Icon,
  Logout01Icon, 
  ArrowRight01Icon,
  UserIcon,
  Store01Icon
} from "hugeicons-react-native";

import { GRADIENT } from "../../constants/theme";
import { useUIStore } from "../../store/ui";

const { width, height } = Dimensions.get("window");
const PANEL_WIDTH = width * 0.85; 

const ACTIVE_COLOR = "#fb923c"; 
const ACTIVE_BG_COLOR = "rgba(251, 146, 60, 0.12)"; 

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  email?: string;
  branch?: string;
  onLogout?: () => void;
}

const ProfilePanel = ({
  isOpen,
  onClose,
  userName = "Misafir",
  email = "demo@v3rii.com",
  branch = "Merkez Şube",
  onLogout,
}: ProfilePanelProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { colors, themeMode } = useUIStore();

  const translateX = useSharedValue(PANEL_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(PANEL_WIDTH, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleMenuItemPress = (action: string) => {
    handleClose();
    setTimeout(() => {
      if (action === "settings") {
        router.push("/settings" as never);
      }
    }, 150);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!isOpen && translateX.value === PANEL_WIDTH) return null;

  const panelHeight = height - insets.top;

  return (
    <Modal
      transparent
      visible={isOpen}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <AnimatedBlurView
            intensity={Platform.OS === "android" ? 50 : 20}
            tint={themeMode === "dark" ? "dark" : "light"}
            style={[StyleSheet.absoluteFill, backdropStyle]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.panel,
            {
              width: PANEL_WIDTH,
              marginTop: insets.top,
              height: panelHeight,
              backgroundColor: colors.background,
              borderLeftColor: colors.border,
              paddingTop: 10,
            },
            animatedStyle,
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }} /> 
            <TouchableOpacity 
              onPress={handleClose} 
              style={[styles.closeButton, { backgroundColor: colors.card }]}
            >
              <Cancel01Icon size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.userInfoContainer}>
              <LinearGradient
                colors={[...GRADIENT.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarBorder}
              >
                <View style={[styles.avatarInner, { backgroundColor: colors.background }]}>
                   <UserIcon size={32} color={colors.text} />
                </View>
              </LinearGradient>

              <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]}>{email}</Text>

              <View style={styles.infoBoxes}>
                <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Store01Icon size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Şube:</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                    {branch}
                  </Text>
                </View>
              </View>
            </View>

            <LinearGradient
              colors={['transparent', colors.border || 'rgba(255,255,255,0.2)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.separator}
            />

            <View style={styles.menuContainer}>
              <Pressable
                onPress={() => handleMenuItemPress("profile")}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: ACTIVE_BG_COLOR }
                ]}
              >
                 {({ pressed }) => (
                  <View style={styles.menuItemInner}>
                    <View style={[styles.iconBox, { backgroundColor: pressed ? "transparent" : colors.card }]}>
                      <UserIcon size={20} color={pressed ? ACTIVE_COLOR : colors.text} />
                    </View>
                    <Text style={[
                      styles.menuText, 
                      { color: pressed ? ACTIVE_COLOR : colors.text, fontWeight: pressed ? "700" : "500" }
                    ]}>
                      Profilim
                    </Text>
                    <ArrowRight01Icon size={16} color={pressed ? ACTIVE_COLOR : colors.textMuted} style={{ marginLeft: "auto", opacity: pressed ? 1 : 0.5 }} />
                  </View>
                 )}
              </Pressable>

              <Pressable
                onPress={() => handleMenuItemPress("settings")}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: ACTIVE_BG_COLOR }
                ]}
              >
                 {({ pressed }) => (
                  <View style={styles.menuItemInner}>
                    <View style={[styles.iconBox, { backgroundColor: pressed ? "transparent" : colors.card }]}>
                      <Settings02Icon size={20} color={pressed ? ACTIVE_COLOR : colors.text} />
                    </View>
                    <Text style={[
                      styles.menuText, 
                      { color: pressed ? ACTIVE_COLOR : colors.text, fontWeight: pressed ? "700" : "500" }
                    ]}>
                      Ayarlar
                    </Text>
                    <ArrowRight01Icon size={16} color={pressed ? ACTIVE_COLOR : colors.textMuted} style={{ marginLeft: "auto", opacity: pressed ? 1 : 0.5 }} />
                  </View>
                 )}
              </Pressable>
            </View>
          </ScrollView>

          <LinearGradient
            colors={['transparent', colors.border || 'rgba(255,255,255,0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.separator, { marginTop: 0, marginBottom: 0 }]}
          />

          <View style={[
            styles.footer, 
            { 
              paddingBottom: insets.bottom + 10 
            }
          ]}>
            <Pressable 
              style={({ pressed }) => [
                styles.menuItem, 
                pressed && { backgroundColor: "rgba(239, 68, 68, 0.1)" }
              ]} 
              onPress={onLogout}
            >
              {({ pressed }) => (
                <View style={styles.menuItemInner}>
                  <View style={[styles.iconBox, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
                    <Logout01Icon size={20} color="#EF4444" />
                  </View>
                  <Text style={styles.logoutText}>Çıkış Yap</Text>
                </View>
              )}
            </Pressable>
            
            <Text style={[styles.companyText, { color: colors.textMuted }]}>
              V3RII COMPANY
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end", 
  },
  panel: {
    borderLeftWidth: 1,
    borderTopLeftRadius: 24, 
    borderBottomLeftRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
    overflow: "hidden", 
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  avatarBorder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
  },
  infoBoxes: {
    width: "100%",
    marginTop: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    width: "80%", 
    alignSelf: "center",
    marginVertical: 15, 
  },
  menuContainer: {
    gap: 4,
  },
  menuItem: {
    marginBottom: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItemInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10, 
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
  companyText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.5,
    opacity: 0.5,
    marginTop: 20,
    marginBottom: -20,
  },
});

export default ProfilePanel;