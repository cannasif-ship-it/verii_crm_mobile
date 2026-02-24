import React, { useState, useCallback } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useUIStore } from "../../../store/ui";
import { 
  Search01Icon, 
  Cancel01Icon 
} from "hugeicons-react-native";

interface SearchInputProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onSearch,
  placeholder = "Ara...",
}: SearchInputProps): React.ReactElement {
  const { colors, themeMode } = useUIStore();
  const isDark = themeMode === "dark";
  const primaryColor = "#db2777";
  
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = useCallback(
    (text: string) => {
      setLocalValue(text);
      onSearch(text);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onSearch("");
  }, [onSearch]);

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
          borderColor: isFocused ? primaryColor : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'),
          // Odaklandığında hafif bir ışıltı
          shadowColor: primaryColor,
          shadowOpacity: isFocused ? 0.15 : 0,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Search01Icon 
          size={18} 
          color={isFocused ? primaryColor : colors.textMuted} 
          variant="stroke" 
          strokeWidth={2}
        />
      </View>

      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={localValue}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
        autoCapitalize="none"
        autoCorrect={false}
        selectionColor={primaryColor}
      />

      {localValue.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <View style={[styles.clearIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Cancel01Icon size={14} color={colors.textMuted} variant="stroke" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 48,
    // Premium soft shadow (iOS)
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    // Android elevation
    elevation: 2,
  },
  iconWrap: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: Platform.OS === 'ios' ? 0 : 8,
    letterSpacing: -0.2,
  },
  clearButton: {
    paddingLeft: 10,
  },
  clearIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});