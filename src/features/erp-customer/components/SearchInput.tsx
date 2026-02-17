import React, { useState, useCallback } from "react";
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from "react-native";
import { useUIStore } from "../../../store/ui";
import { Search01Icon, Cancel01Icon } from "hugeicons-react-native";

// --- SABİT RENKLER (Kartlarla Uyumlu) ---
const BRAND_COLOR = "#db2777";
const BRAND_COLOR_DARK = "#ec4899";

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

  // Focus durumunu takip ediyoruz (Çerçeve rengi için)
  const [isFocused, setIsFocused] = useState(false);

  // Tema renkleri
  const theme = {
    bg: isDark ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9",
    border: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
    activeBorder: isDark ? BRAND_COLOR_DARK : BRAND_COLOR, // Focus olunca pembe
    icon: isDark ? "#94a3b8" : "#64748b",
    activeIcon: isDark ? BRAND_COLOR_DARK : BRAND_COLOR,
    text: colors.text,
    placeholder: isDark ? "#64748b" : "#94a3b8",
  };

  const handleChangeText = useCallback(
    (text: string) => {
      onSearch(text);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    onSearch("");
  }, [onSearch]);

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: theme.bg, 
          borderColor: isFocused ? theme.activeBorder : theme.border 
        },
      ]}
    >
      {/* SOL: ARAMA İKONU */}
      <View style={styles.iconLeft}>
        <Search01Icon 
          size={18} 
          color={isFocused ? theme.activeIcon : theme.icon} 
          variant="stroke"
          strokeWidth={2}
        />
      </View>

      {/* ORTA: INPUT */}
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value} // Parent component state'ini kullanıyoruz
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        
        // Focus Olayları
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        
        // İmleç Rengi
        selectionColor={theme.activeIcon}
        cursorColor={theme.activeIcon} // Android için
      />

      {/* SAĞ: TEMİZLE BUTONU (Sadece yazı varsa görünür) */}
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          style={styles.clearButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.clearIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }]}>
            <Cancel01Icon 
                size={12} 
                color={isDark ? "#FFF" : "#fff"} 
                variant="stroke" // İçi dolu çarpı
            />
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
    borderRadius: 14, // Kartlara uyumlu yuvarlaklık
    borderWidth: 1.5, // Focus olunca belli olsun diye biraz kalın
    height: 50, // Parmakla dokunmak için ideal yükseklik
    marginBottom: 0, // Dış boşluğu parent yönetir
  },
  iconLeft: {
    paddingLeft: 14,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    padding: 0, // Android padding sıfırlama
    height: '100%',
  },
  clearButton: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});