import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  maxLength?: number;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  autoCapitalize = "sentences",
  editable = true,
  maxLength,
}: FormFieldProps): React.ReactElement {
  const { colors, themeMode } = useUIStore();
  const [isFocused, setIsFocused] = useState(false);

  const isDark = themeMode === "dark";

  // --- TEMA AYARLARI ---
  const THEME = {
    label: isDark ? "#94a3b8" : colors.textSecondary, // Slate-400
    inputBg: isDark ? "rgba(255,255,255,0.05)" : colors.backgroundSecondary,
    border: isDark ? "rgba(255,255,255,0.1)" : colors.border,
    focusBorder: "#db2777", // Neon Pembe (Focus Rengi)
    text: isDark ? "#FFFFFF" : colors.text,
    placeholder: isDark ? "#64748B" : colors.textMuted,
    error: "#ef4444"
  };

  // Kenarlık Rengi Belirleme (Hata > Focus > Normal)
  const getBorderColor = () => {
    if (error) return THEME.error;
    if (isFocused) return THEME.focusBorder;
    return THEME.border;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: THEME.label }]}>{label}</Text>
        {required && <Text style={[styles.required, { color: THEME.error }]}>*</Text>}
      </View>
      
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: THEME.inputBg,
            borderColor: getBorderColor(),
            color: THEME.text,
          },
          multiline && { height: numberOfLines * 24 + 24, textAlignVertical: "top" },
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME.placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        maxLength={maxLength}
        // Focus Olayları
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      {error && <Text style={[styles.error, { color: THEME.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // Biraz daha boşluk
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  required: {
    fontSize: 14,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12, // Modern Squircle
    paddingHorizontal: 14,
    paddingVertical: 14, // Biraz daha yüksek (Touch target için)
    fontSize: 15,
    fontWeight: "500",
  },
  inputDisabled: {
    opacity: 0.5,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
});