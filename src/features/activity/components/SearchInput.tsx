import React, { useState, useCallback } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useUIStore } from "../../../store/ui";
import { Search01Icon, Cancel01Icon } from "hugeicons-react-native";

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
  const { colors, themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const THEME = {
    bg: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    focusBorder: "#db2777", 
    text: colors.text,
    placeholder: isDark ? "#94A3B8" : "#64748B",
    icon: isDark ? "#94A3B8" : "#64748B",
    clearBtnBg: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
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
      {/* İkon da tıklandığında pembe oluyor */}
      <Search01Icon 
        size={20} 
        color={isFocused ? THEME.focusBorder : THEME.icon} 
        variant="stroke" 
        strokeWidth={2} 
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
          style={styles.clearButton} 
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.clearIconWrapper, { backgroundColor: THEME.clearBtnBg }]}>
            <Cancel01Icon size={14} color={THEME.text} variant="stroke" strokeWidth={2} />
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
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50, 
    
  
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
    fontWeight: "500",
    letterSpacing: 0.2,
    padding: 0,
    height: '100%',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearIconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  }
});