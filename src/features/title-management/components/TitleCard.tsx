import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import type { TitleDto } from "../types";

interface TitleCardProps {
  title: TitleDto;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TitleCardComponent({
  title,
  onPress,
  onEdit,
  onDelete,
}: TitleCardProps): React.ReactElement {
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
      <View style={styles.content}>
        <View style={styles.headerLeft}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {title.titleName}
          </Text>
          {title.code && (
            <Text style={[styles.code, { color: colors.textMuted }]}>{title.code}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.activeBackground }]}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Text style={[styles.actionIcon, { color: colors.accent }]}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.activeBackground }]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Text style={[styles.actionIcon, { color: colors.error }]}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const TitleCard = memo(TitleCardComponent);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  code: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 16,
  },
});
