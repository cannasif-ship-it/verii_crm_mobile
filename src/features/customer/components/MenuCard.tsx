import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";

interface MenuCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}

export function MenuCard({ title, description, icon, onPress }: MenuCardProps): React.ReactElement {
  const { colors } = useUIStore();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 24,
    fontWeight: "300",
  },
});
