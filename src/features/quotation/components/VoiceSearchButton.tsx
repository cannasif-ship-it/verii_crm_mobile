import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";
import { useSpeechToText } from "../hooks/useSpeechToText";

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
  disabled?: boolean;
}

export function VoiceSearchButton({
  onResult,
  disabled = false,
}: VoiceSearchButtonProps): React.ReactElement {
  const { colors } = useUIStore();
  const { startListening, isListening } = useSpeechToText();

  const handlePress = () => {
    if (disabled) return;
    startListening(onResult);
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isListening ? colors.accent + "40" : colors.backgroundSecondary,
          borderColor: colors.border,
        },
        disabled && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel="Sesli arama"
    >
      <Text style={[styles.icon, { color: isListening ? colors.accent : colors.textMuted }]}>
        {isListening ? "⏹" : "🎤"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 20,
  },
});
