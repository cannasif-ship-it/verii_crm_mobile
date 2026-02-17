import React, { memo, useMemo, useState } from "react";
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  TouchableWithoutFeedback,
  Platform
} from "react-native";
import { 
  Call02Icon, 
  Mail01Icon, 
  Location01Icon, 
  ArrowRight01Icon,
  UserCircleIcon
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

// --- YARDIMCI FONKSİYONLAR ---

const getInitials = (name: string) => {
  return name?.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, "").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
};

const getAvatarColor = (name: string) => {
  const colors = ["#db2777", "#7c3aed", "#2563eb", "#059669", "#ea580c", "#dc2626", "#0891b2"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatPhoneNumber = (phone: string | null | undefined) => {
  if (!phone) return null;
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})?(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return [match[2], match[3], match[4], match[5]].join(' ');
  }
  return phone;
};

const CustomerCardComponent = ({ customer, viewMode, onPress }: CustomerCardProps) => {
  const { themeMode } = useUIStore();
  const [isPressed, setIsPressed] = useState(false); // Basma durumunu takip ediyoruz

  const isDark = themeMode === "dark";
  const isGrid = viewMode === 'grid';

  // Dinamik Veriler
  const avatarColor = useMemo(() => getAvatarColor(customer.name || "?"), [customer.name]);
  const initials = useMemo(() => getInitials(customer.name || "?"), [customer.name]);
  const formattedPhone = useMemo(() => formatPhoneNumber(customer.phone), [customer.phone]);
  
  const displayContact = formattedPhone || customer.email || "-";
  const ContactIcon = customer.phone ? Call02Icon : Mail01Icon;

  // --- TEMA ---
  const THEME = {
    bg: isDark ? "rgba(30, 41, 59, 0.6)" : "#FFFFFF",
    activeBg: isDark ? "rgba(255, 255, 255, 0.05)" : "#F8FAFC",
    
    border: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    activeBorder: avatarColor, // 🔥 BASINCA BU RENK OLACAK
    
    text: isDark ? "#FFFFFF" : "#0F172A",
    textMute: isDark ? "#94a3b8" : "#64748B",
    
    avatarBg: `${avatarColor}15`,
    avatarText: avatarColor,
  };

  const locationText = useMemo(() => {
    const parts = [customer.cityName, customer.countryName].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }, [customer]);

  // --- AVATAR KUTUSU ---
  const AvatarBox = ({ size }: { size: number }) => (
    <View style={[styles.avatarBox, { 
      width: size, 
      height: size, 
      borderRadius: isGrid ? 14 : size / 2, 
      backgroundColor: THEME.avatarBg,
      borderColor: `${avatarColor}30`,
      borderWidth: 1
    }]}>
      <Text style={[styles.avatarText, { color: THEME.avatarText, fontSize: size * 0.38 }]}>
        {initials}
      </Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}  // Basınca tetiklenir
      onPressOut={() => setIsPressed(false)} // Bırakınca tetiklenir
    >
      <View
        style={[
          isGrid ? styles.gridCard : styles.listCard,
          {
            backgroundColor: isPressed && !isGrid ? THEME.activeBg : THEME.bg,
            
            // 🔥 HOVER BORDER MANTIĞI BURADA
            borderColor: isPressed ? THEME.activeBorder : THEME.border,
            
            // Listede basınca çizgi biraz daha kalınlaşsın (belirgin olsun diye)
            borderBottomWidth: !isGrid && isPressed ? 2 : 1,
            
            // Grid'de scale efekti yerine hafif gölge artışı veya transform
            transform: isGrid && isPressed ? [{ scale: 0.98 }] : [], 
          },
          isGrid && { shadowColor: isDark ? "#000" : "#94a3b8" }
        ]}
      >
        {isGrid ? (
          // === GRID GÖRÜNÜMÜ ===
          <>
            <View style={styles.gridHeader}>
              <AvatarBox size={42} />
              {customer.customerTypeName && (
                 <View style={[styles.badge, { borderColor: THEME.border }]}>
                    <Text style={[styles.badgeText, { color: THEME.textMute }]} numberOfLines={1}>
                       {customer.customerTypeName}
                    </Text>
                 </View>
              )}
            </View>

            <View style={styles.gridBody}>
              <Text style={[styles.gridName, { color: THEME.text }]} numberOfLines={2}>
                {customer.name}
              </Text>
              
              <View style={styles.row}>
                 <ContactIcon size={12} color={THEME.textMute} />
                 <Text style={[styles.contactText, { color: THEME.textMute, marginLeft: 4 }]} numberOfLines={1}>
                    {displayContact}
                 </Text>
              </View>
            </View>

            <View style={styles.gridFooter}>
                <Location01Icon size={12} color={THEME.textMute} />
                <Text style={[styles.footerText, { color: THEME.textMute, marginLeft: 4 }]} numberOfLines={1}>
                  {locationText || "Konum Yok"}
                </Text>
            </View>
          </>
        ) : (
          // === LIST GÖRÜNÜMÜ ===
          <>
            <View style={styles.listLeft}>
              <AvatarBox size={46} />
            </View>
            
            <View style={styles.listContent}>
               
               {/* 1. İSİM + OK */}
               <View style={styles.listHeaderRow}>
                  <Text style={[styles.listName, { color: THEME.text }]} numberOfLines={1}>
                    {customer.name}
                  </Text>
                  <ArrowRight01Icon 
                    size={16} 
                    color={isPressed ? THEME.activeBorder : THEME.textMute} // Basınca ok da renklenir
                    style={{ opacity: isPressed ? 1 : 0.4, marginLeft: 4 }} 
                  />
               </View>

               {/* 2. İLETİŞİM */}
               <View style={[styles.row, { marginTop: 2, marginBottom: 4 }]}>
                  <ContactIcon size={13} color={THEME.textMute} />
                  <Text style={[styles.contactText, { color: THEME.textMute, marginLeft: 5 }]} numberOfLines={1}>
                    {displayContact}
                  </Text>
               </View>

               {/* 3. TİP ve LOKASYON */}
               <View style={styles.listFooterColumn}>
                  {customer.customerTypeName ? (
                    <View style={[styles.row, { marginRight: 10 }]}>
                      <UserCircleIcon size={12} color={THEME.textMute} />
                      <Text style={[styles.listDetailText, { color: THEME.textMute }]} numberOfLines={1}>
                        {customer.customerTypeName}
                      </Text>
                    </View>
                  ) : null}
                  
                  {locationText && (
                    <View style={styles.row}>
                      <Location01Icon size={12} color={THEME.textMute} />
                      <Text style={[styles.listDetailText, { color: THEME.textMute }]} numberOfLines={1}>
                        {locationText}
                      </Text>
                    </View>
                  )}
               </View>
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
  gridCard: {
    width: GRID_WIDTH,
    height: 180,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 0,
  },
  gridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  gridBody: { flex: 1, justifyContent: 'center', paddingVertical: 8 },
  gridName: { fontSize: 14, fontWeight: "700", marginBottom: 6, lineHeight: 18, letterSpacing: -0.2 },
  gridFooter: { 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(0,0,0,0.04)', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  badge: { 
    paddingHorizontal: 6, 
    paddingVertical: 3, 
    borderRadius: 6, 
    borderWidth: 1, 
    maxWidth: '45%' 
  },
  badgeText: { fontSize: 9, fontWeight: "600" },

  // --- LIST STYLES ---
  listCard: {
    width: '100%',
    height: 90, // Sabit yükseklik (Kaymayı önler)
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    // borderBottomColor burada verilmez, dinamik stilde verilir
    overflow: 'hidden',
  },
  listLeft: {
    marginRight: 14,
    paddingLeft: 4,
    justifyContent: 'center',
    height: '100%',
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 6,
    height: '100%',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  listName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    letterSpacing: -0.3,
  },
  listFooterColumn: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDetailText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
  },

  // --- ORTAK ---
  avatarBox: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: "800", letterSpacing: 0.5 },
  
  contactText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', 
    letterSpacing: 0.2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 11, fontWeight: "500" },
});