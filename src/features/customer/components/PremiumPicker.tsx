import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { Text } from "../../../components/ui/text"; 
import { useUIStore } from "../../../store/ui"; 
import { ArrowDown01Icon, CheckmarkCircle02Icon } from "hugeicons-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface PickerItem {
  label: string;
  value: string | number;
}

interface PremiumPickerProps {
  label?: string;
  items: PickerItem[];
  value?: string | number | null;
  onValueChange: (value: any) => void;
  placeholder?: string;
  error?: string;
}

export function PremiumPicker({
  label,
  items,
  value,
  onValueChange,
  placeholder = "Seçiniz",
  error,
}: PremiumPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { themeMode } = useUIStore();
  const insets = useSafeAreaInsets();
  const isDark = themeMode === "dark";

  // Seçili öğeyi bul
  const selectedItem = items.find((item) => item.value === value);

  const THEME = {
    // Input
    inputBg: isDark ? "rgba(0,0,0,0.3)" : "#F8FAFC",
    inputBorder: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)",
    
    // Modal
    modalBg: isDark ? "#0f172a" : "#FFFFFF",
    modalBorder: isDark ? "rgba(255,255,255,0.08)" : "transparent",
    
    // Yazılar
    text: isDark ? "#F8FAFC" : "#0F172A",
    textMute: isDark ? "#94a3b8" : "#64748B",
    
    // Ana Renk (Pembe)
    primary: "#db2777", 
    
    // Liste Çizgileri
    itemBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    
    // "Pembemsi" Seçili Arka Planı (Hafif ve Premium)
    selectedBg: isDark ? 'rgba(219, 39, 119, 0.15)' : '#FFF0F5', 
    
    overlay: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
    shadow: isDark ? "#000000" : "#64748b",
  };

  const handleSelect = (val: any) => {
    onValueChange(val);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: THEME.textMute }]}>{label}</Text>}

      {/* TETİKLEYİCİ */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsOpen(true)}
        style={[
          styles.trigger,
          { 
            backgroundColor: THEME.inputBg, 
            borderColor: error ? "#ef4444" : THEME.inputBorder 
          },
        ]}
      >
        <Text 
          style={[
            styles.triggerText, 
            { color: selectedItem ? THEME.text : THEME.textMute }
          ]}
          numberOfLines={1}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <ArrowDown01Icon 
            size={20} 
            color={THEME.textMute} 
            variant="stroke"
            strokeWidth={1.5} 
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* MODAL */}
      <Modal 
        visible={isOpen} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
      >
        <View style={[styles.modalOverlay, { backgroundColor: THEME.overlay }]}>
          <TouchableOpacity style={styles.backdrop} onPress={() => setIsOpen(false)} activeOpacity={1} />
          
          <View style={[
              styles.modalContent, 
              { 
                backgroundColor: THEME.modalBg, 
                paddingBottom: insets.bottom + 10,
                borderColor: THEME.modalBorder,
                shadowColor: THEME.shadow
              }
            ]}>
            
            {/* Başlık */}
            <View style={[styles.header, { borderBottomColor: THEME.itemBorder }]}>
              <View style={[styles.handle, { backgroundColor: THEME.textMute }]} />
              <Text style={[styles.modalTitle, { color: THEME.text }]}>
                {label || placeholder}
              </Text>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => String(item.value)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7} // Dokunma hissi için
                    onPress={() => handleSelect(item.value)}
                    style={[
                        styles.optionItem,
                        { 
                            borderBottomColor: THEME.itemBorder,
                            // SEÇİLİ OLUNCA PEMBEMSİ ARKA PLAN
                            backgroundColor: isSelected ? THEME.selectedBg : 'transparent'
                        }
                    ]}
                  >
                    <Text 
                        style={[
                            styles.optionText, 
                            { 
                              color: isSelected ? THEME.primary : THEME.text, 
                              fontWeight: isSelected ? "700" : "500" 
                            }
                        ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                        <CheckmarkCircle02Icon 
                            size={22} 
                            color={THEME.primary} 
                            variant="stroke" // İSTEDİĞİN GİBİ STROKE
                            strokeWidth={2}
                        />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={{ color: THEME.textMute }}>Veri bulunamadı.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginBottom: 0 
  },
  label: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginBottom: 8,
    marginLeft: 2
  },
  trigger: {
    height: 56,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  triggerText: { 
    fontSize: 15, 
    fontWeight: "500",
    flex: 1,
    marginRight: 10,
    marginTop: Platform.OS === 'android' ? 2 : 0 
  },
  errorText: { 
    color: "#ef4444", 
    fontSize: 12, 
    marginTop: 6, 
    marginLeft: 4,
    fontWeight: '500'
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: "flex-end" 
  },
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: Dimensions.get("window").height * 0.75,
    minHeight: 250,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  header: { 
    alignItems: "center", 
    paddingTop: 16,
    paddingBottom: 16, 
    borderBottomWidth: 1,
  },
  handle: { 
    width: 48, 
    height: 5, 
    borderRadius: 3, 
    marginBottom: 14,
    opacity: 0.25
  },
  modalTitle: { 
    fontSize: 17, 
    fontWeight: "700",
    letterSpacing: -0.3
  },
  listContent: {
      paddingBottom: 20
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18, 
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  optionText: { 
    fontSize: 16,
    letterSpacing: -0.2
  },
  emptyContainer: {
      padding: 30,
      alignItems: 'center',
      justifyContent: 'center'
  }
});