import React, { useState, useCallback } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
// HugeIcons
import { Search01Icon, Cancel01Icon } from "hugeicons-react-native";
// UI Store
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
  // --- STATE ---
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // --- TEMA (DİNAMİK) ---
  const { themeMode, colors } = useUIStore();
  const isDark = themeMode === "dark";

  const THEME = {
    // Arka Plan: Koyu ise #1e1b29, Açık ise Beyaz
    bg: isDark ? "#1e1b29" : "#FFFFFF", 
    
    // Çerçeve: Koyu ise şeffaf beyaz, Açık ise gri (#E2E8F0)
    border: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0", 
    
    // Focus Rengi: Her iki modda da Neon Pembe
    focusBorder: "#db2777", 
    
    // Metin Rengi: Koyu ise Beyaz, Açık ise Koyu Gri (#0F172A)
    text: isDark ? "#FFFFFF" : "#0F172A",
    
    // Placeholder: Koyu ise Slate-500, Açık ise Slate-400
    placeholder: isDark ? "#64748B" : "#94a3b8", 
    
    // İkon Rengi
    icon: isDark ? "#94a3b8" : "#64748B",
    
    // Temizle Butonu Arka Planı
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
      {/* Sol Arama İkonu */}
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

      {/* Temizle Butonu (X) */}
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
    borderWidth: 1, // Kenarlık her zaman var
    paddingHorizontal: 12,
    height: 48,
    // Gölge efekti (Hafif derinlik)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, // Gölgeyi biraz azalttım, açık modda daha temiz dursun
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0, // Android'de dikey kaymayı önler
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
  },
});