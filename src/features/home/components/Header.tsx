import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useAuthStore } from "../../../store/auth";
import { GRADIENT } from "../../../constants/theme";
import type { User } from "../types";

interface HeaderProps {
  user: User | undefined;
  onSettingsPress: () => void;
}

export function Header({ user, onSettingsPress }: HeaderProps): React.ReactElement {
  const { t } = useTranslation();
  const { colors } = useUIStore();
  const branch = useAuthStore((state) => state.branch);

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.header }]}>
      <View style={styles.left}>
        <LinearGradient
          colors={[...GRADIENT.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {user ? getInitials(user.name) : "??"}
          </Text>
        </LinearGradient>
        <View style={styles.info}>
          <Text style={styles.greeting}>
            {t("home.greeting")}, {user?.name.split(" ")[0] || ""}
          </Text>
          <Text style={[styles.branch, { color: colors.textSecondary }]}>
            {branch ? `${branch.code} - ${branch.name}` : t("home.branch")}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  info: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  branch: {
    fontSize: 13,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: {
    fontSize: 20,
  },
});
