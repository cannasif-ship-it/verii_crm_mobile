import React, { memo, useMemo, useState } from "react";
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  TouchableWithoutFeedback,
  DimensionValue,
  Platform
} from "react-native";
import { 
  BarCode01Icon,
  Globe02Icon,
  ArrowRight01Icon,
  Building03Icon
} from "hugeicons-react-native";
import type { CustomerDto } from "../types";
import { useUIStore } from "../../../store/ui";

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 16;
const GRID_WIDTH = (width - (PADDING * 2) - GAP) / 2;

interface CustomerCardProps {
  customer: CustomerDto;
  viewMode: 'grid' | 'list';
  onPress: () => void;
}

const getInitials = (name: string) => {
  return name?.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, "").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
};

const getAvatarColor = (name: string) => {
  const colors = ["#db2777", "#9333ea", "#2563eb", "#059669", "#d97706", "#dc2626"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const CustomerCardComponent = ({ customer, viewMode, onPress }: CustomerCardProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  // --- TEMA ---
  const THEME = {
    // Grid
    gridBg: isDark ? "#1e1b29" : "#FFFFFF",
    gridBorder: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    
    // List (Daha Belirgin)
    listBg: isDark ? "#1a0b2e" : "#FFFFFF",
    listPressed: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC",
    // Çizgi rengini biraz daha belirgin yaptım
    divider: isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1", 
    
    text: isDark ? "#FFFFFF" : "#0F172A",
    textMute: isDark ? "#94a3b8" : "#64748B",
    primary: "#db2777",
  };

  const initials = getInitials(customer.name);
  const avatarColor = getAvatarColor(customer.name);
  
  const locationText = useMemo(() => {
    const parts = [customer.cityName, customer.countryName].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }, [customer]);

  const containerStyle = useMemo(() => {
    if (viewMode === 'grid') {
      // GRID (KUTU)
      return {
        backgroundColor: THEME.gridBg,
        borderColor: isPressed ? THEME.primary : THEME.gridBorder,
        borderWidth: 1,
        width: GRID_WIDTH as DimensionValue,
        borderRadius: 16,
        padding: 12,
        height: 175,
        justifyContent: 'space-between' as const,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: 4,
        elevation: 3,
      };
    } else {
      // LIST (SATIR - Daha belirgin çizgili)
      return {
        width: '100%' as DimensionValue,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingVertical: 16, // Satır yüksekliği arttı
        paddingHorizontal: 12,
        backgroundColor: isPressed ? THEME.listPressed : THEME.listBg,
        borderBottomWidth: 1, // Çizgi kalınlığı 1px (hairline değil)
        borderBottomColor: THEME.divider, // Daha belirgin renk
        borderRadius: 0,
      };
    }
  }, [viewMode, isPressed, THEME, isDark]);

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <View style={containerStyle}>
        
        {viewMode === 'grid' ? (
          // --- GRID MODU (AYNI) ---
          <>
            <View style={styles.gridHeader}>
              <View style={[styles.avatar, { backgroundColor: `${avatarColor}15`, borderColor: `${avatarColor}30` }]}>
                <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
              </View>
              {customer.customerTypeName && (
                 <View style={[styles.badge, { borderColor: THEME.divider }]}>
                    <Text style={[styles.badgeText, { color: THEME.textMute }]} numberOfLines={1}>{customer.customerTypeName}</Text>
                 </View>
              )}
            </View>
            <View style={styles.gridContent}>
                <Text style={[styles.gridName, { color: THEME.text }]} numberOfLines={2}>
                  {customer.name}
                </Text>
                <View style={styles.infoRow}>
                   <BarCode01Icon size={14} color={THEME.textMute} variant="stroke" />
                   <Text style={[styles.infoText, { color: THEME.textMute }]}>
                     {customer.customerCode || "-"}
                   </Text>
                </View>
                {customer.taxNumber && (
                   <View style={[styles.infoRow, { marginTop: 2 }]}>
                      <Building03Icon size={14} color={THEME.textMute} variant="stroke" />
                      <Text style={[styles.infoText, { color: THEME.textMute, fontSize: 10 }]}>
                        VN: {customer.taxNumber}
                      </Text>
                   </View>
                )}
            </View>
            <View style={[styles.divider, { backgroundColor: THEME.divider }]} />
            <View style={styles.gridFooter}>
               <View style={styles.row}>
                  <Globe02Icon size={12} color={THEME.textMute} />
                  <Text style={[styles.footerText, { color: THEME.textMute }]} numberOfLines={1}>
                    {locationText || "Konum Yok"}
                  </Text>
               </View>
            </View>
          </>
        ) : (
          // --- LIST MODU (SADELEŞTİRİLMİŞ) ---
          <>
            {/* Avatar */}
            <View style={[styles.listAvatar, { backgroundColor: `${avatarColor}15`, borderColor: `${avatarColor}30` }]}>
              <Text style={[styles.listAvatarText, { color: avatarColor }]}>{initials}</Text>
            </View>

            {/* Orta Kısım */}
            <View style={styles.listContent}>
              {/* İsim */}
              <Text style={[styles.listName, { color: THEME.text }]} numberOfLines={1}>
                  {customer.name}
              </Text>
              
              {/* Sadece Kod + Lokasyon */}
              <View style={styles.listBottomRow}>
                  {/* Kod İkonlu */}
                  <View style={styles.row}>
                     <BarCode01Icon size={12} color={THEME.textMute} style={{marginRight: 4}} variant="stroke" />
                     <Text style={[styles.listDetailText, { color: THEME.textMute }]}>
                        {customer.customerCode || "-"}
                     </Text>
                  </View>

                  {/* Lokasyon Varsa */}
                  {locationText && (
                    <>
                      <View style={[styles.dot, { backgroundColor: THEME.textMute }]} />
                      <Text style={[styles.listDetailText, { color: THEME.textMute, flex: 1 }]} numberOfLines={1}>
                          {locationText}
                      </Text>
                    </>
                  )}
              </View>
            </View>

            {/* Sağ Ok */}
            <View style={styles.listRight}>
               <ArrowRight01Icon size={18} color={THEME.textMute} variant="stroke" />
            </View>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export const CustomerCard = memo(CustomerCardComponent);

const styles = StyleSheet.create({
  // --- GRID STYLES ---
  gridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: "700" },
  gridContent: { flex: 1, justifyContent: 'center' },
  gridName: { fontSize: 14, fontWeight: "700", marginBottom: 6, lineHeight: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  infoText: { fontSize: 11, fontWeight: "500" },
  divider: { height: 1, marginVertical: 10 },
  gridFooter: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 11, fontWeight: "500", marginLeft: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, maxWidth: '55%', borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "600" },

  // --- LIST STYLES (DAHA NET) ---
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  listAvatarText: { fontSize: 15, fontWeight: "700" },
  
  listContent: { 
    flex: 1, 
    justifyContent: 'center',
    gap: 4 // İsim ve detay arası boşluk
  },
  
  listName: { 
    fontSize: 16, // İsim biraz büyüdü
    fontWeight: "600", 
  },
  
  listBottomRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  
  listDetailText: { 
    fontSize: 13,
    fontWeight: "500" 
  },
  
  dot: { 
    width: 3, 
    height: 3, 
    borderRadius: 1.5, 
    marginHorizontal: 8,
    opacity: 0.6
  },
  
  listRight: { 
    paddingLeft: 12 
  },
});