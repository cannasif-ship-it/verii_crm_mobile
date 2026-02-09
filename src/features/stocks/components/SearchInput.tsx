import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Dimensions } from "react-native";
import { useUIStore } from "../../../store/ui";
// HugeIcons: Emojiler yerine profesyonel ikonlar
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
  const { themeMode } = useUIStore() as any;
  const isDark = themeMode === "dark";
  const [isFocused, setIsFocused] = useState(false);

  // --- TEMA RENKLERİ ---
  const theme = {
    // Input Arka Planı: StockListScreen header'ından bir tık daha açık/farklı olmalı
    bg: isDark ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9",
    border: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
    text: isDark ? "#FFFFFF" : "#0F172A",
    placeholder: isDark ? "#64748B" : "#94A3B8",
    icon: isDark ? "#94A3B8" : "#64748B",
    primary: "#db2777", // Pembe vurgu
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
          borderColor: isFocused ? theme.primary : theme.border,
          // Focus olunca border kalınlaşsın
          borderWidth: isFocused ? 1.5 : 1,
        },
      ]}
    >
      {/* SOL: ARAMA İKONU */}
      <View style={styles.iconLeft}>
        <Search01Icon 
          size={18} 
          color={isFocused ? theme.primary : theme.icon} 
          variant="stroke"
        />
      </View>

      {/* ORTA: INPUT */}
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        // Doğrudan parent fonksiyonunu çağırıyoruz, senkronizasyon sorunu yok
        onChangeText={onSearch} 
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        // Focus olaylarını yakala
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* SAĞ: TEMİZLEME BUTONU (Sadece yazı varsa görünür) */}
      {value.length > 0 && (
        <Pressable 
          onPress={() => onSearch("")} 
          style={({ pressed }) => [
            styles.clearButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          hitSlop={10} // Parmağın kolay basması için alanı genişlet
        >
          <Cancel01Icon size={16} color={theme.icon} variant="stroke" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14, // Daha yumuşak köşeler
    height: 48, // Standart dokunmatik yükseklik
    paddingHorizontal: 12,
    // Margin'i buradan kaldırdık, parent component (StockList) kontrol etsin diye
  },
  iconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    height: "100%", // Tıklama alanını doldursun
    padding: 0, // Android default padding'i sıfırla
  },
  clearButton: {
    padding: 4,
    borderRadius: 99,
    marginLeft: 8,
  },
});