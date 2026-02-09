import React, { memo, useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Text, DimensionValue } from "react-native";
import { PackageIcon } from "hugeicons-react-native";
import type { StockGetDto } from "../types";

interface StockCardProps {
  item: StockGetDto;
  viewMode: 'grid' | 'list';
  isDark: boolean;
  router: any;
  theme: any;
  gridWidth: number; // Grid genişliğini dışarıdan alacağız
}

const StockCardComponent = ({ item, viewMode, isDark, router, theme, gridWidth }: StockCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  // Grid ve List için stil hesaplaması
  const containerStyle = [
    viewMode === 'grid' ? styles.gridCard : styles.listCard,
    {
      // Grid ise hesaplanan genişlik, List ise %100
      width: (viewMode === 'grid' ? gridWidth : '100%') as DimensionValue,
      backgroundColor: theme.cardBg,
      borderColor: isPressed ? theme.primary : theme.cardBorder, // BASINCA PEMBE
      borderWidth: 1.5, // SABİT KALINLIK (Kaymayı önler)
      shadowColor: isDark ? "#000" : "#94a3b8",
    }
  ];

  return (
    <TouchableWithoutFeedback
      onPress={() => router.push(`/(tabs)/stock/${item.id}`)}
      onPressIn={() => setIsPressed(true)}  
      onPressOut={() => setIsPressed(false)} 
    >
      <View style={containerStyle}>
        
        {/* İKON ALANI */}
        <View style={[
          viewMode === 'grid' ? styles.iconBox : styles.listIconBox, 
          { backgroundColor: theme.primaryBg, marginBottom: viewMode === 'grid' ? 12 : 0 }
        ]}>
           <PackageIcon size={20} color={theme.primary} variant="stroke" />
        </View>

        {/* ORTA BİLGİ */}
        <View style={viewMode === 'list' ? { flex: 1, paddingHorizontal: 12 } : {}}>
          <Text 
            style={[
              viewMode === 'grid' ? styles.gridTitle : styles.listTitle, 
              { color: theme.textTitle }
            ]} 
            numberOfLines={viewMode === 'grid' ? 2 : 1}
          >
            {item.stockName}
          </Text>
          
          {/* List modunda kod hemen ismin altında */}
          {viewMode === 'list' && (
             <Text style={[styles.label, { color: theme.textMute }]}>Kod: {item.erpStockCode || "-"}</Text>
          )}
        </View>

        {/* ALT / SAĞ BİLGİ */}
        <View style={viewMode === 'grid' ? styles.gridFooter : { alignItems: 'flex-end' }}>
           {viewMode === 'grid' ? (
              <Text style={[styles.label, { color: theme.textMute }]}>{item.erpStockCode || "-"}</Text>
           ) : (
              <View style={[styles.badge, { borderColor: theme.cardBorder, marginBottom: 4 }]}>
                <Text style={[styles.badgeText, { color: theme.textMute }]}>{item.grupAdi || "Genel"}</Text>
              </View>
           )}
           
           <View style={[styles.stockBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
            <Text style={[styles.stockText, { color: theme.textTitle, fontSize: 10 }]}>{item.unit || "Adet"}</Text>
           </View>
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
};

export const StockCard = memo(StockCardComponent);

const styles = StyleSheet.create({
  label: { fontSize: 10, fontWeight: '500' },
  stockBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  stockText: { fontSize: 11, fontWeight: '600' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, backgroundColor: 'transparent' },
  badgeText: { fontSize: 9, fontWeight: '600' },

  // GRID KART
  gridCard: {
    borderRadius: 16,
    padding: 12,
    shadowOffset: { width: 0, height: 4 }, 
    shadowRadius: 6, 
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 160, 
  },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  gridTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12, lineHeight: 18, minHeight: 36 },
  gridFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },

  // LIST KART
  listCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12 },
  listIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  listTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
});