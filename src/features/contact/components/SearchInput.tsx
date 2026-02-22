import React, { useState, useCallback } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Search01Icon, Cancel01Icon } from "hugeicons-react-native";
import { useUIStore } from "../../../store/ui";

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
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const THEME = {
    bg: isDark ? "#1e1b29" : "#FFFFFF", 
    border: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0", 
    focusBorder: "#db2777", 
    text: isDark ? "#FFFFFF" : "#0F172A",
    placeholder: isDark ? "#64748B" : "#94a3b8", 
    icon: isDark ? "#94a3b8" : "#64748B",
    clearBtnBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  };

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
          backgroundColor: THEME.bg, 
          borderColor: isFocused ? THEME.focusBorder : THEME.border 
        },
      ]}
    >
      <Search01Icon 
        size={20} 
        color={isFocused ? THEME.focusBorder : THEME.icon} 
        variant="stroke" 
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.input, { color: THEME.text }]}
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {localValue.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          style={[styles.clearButton, { backgroundColor: THEME.clearBtnBg }]}
        >
          <Cancel01Icon size={16} color={THEME.icon} variant="stroke" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
  },
});