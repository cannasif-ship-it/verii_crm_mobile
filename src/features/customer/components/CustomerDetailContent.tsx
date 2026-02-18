import React from "react";
import { View, StyleSheet, ScrollView, Platform, Linking, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Text } from "../../../components/ui/text";
import { useUIStore } from "../../../store/ui"; 
import type { CustomerDto } from "../types";
import { 
  Call02Icon, 
  Mail01Icon, 
  Globe02Icon, 
  Location01Icon, 
  Invoice01Icon, 
  Coins01Icon, 
  WhatsappIcon, 
  CheckmarkCircle02Icon, 
  AlertCircleIcon,
  Calendar03Icon,
  Note01Icon,
  Building03Icon,
  ComputerIcon,
  UserIcon,
  CreditCardIcon,
  Shield02Icon,
  Contact01Icon,
  Briefcase01Icon,
  Activity01Icon,
  MapsCircle01Icon
} from "hugeicons-react-native";

const getInitials = (name: string) => {
  return name?.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, "").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
};

const getAvatarColor = (name: string) => {
  const colors = ["#db2777", "#9333ea", "#2563eb", "#059669", "#d97706", "#dc2626"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

function formatDate(dateString?: string | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(value?: number | null): string | null {
  if (value === undefined || value === null) return null;
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
}

interface ActionButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  color: string;
}

function ActionButton({ icon, onPress, color }: ActionButtonProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress} 
      style={[styles.actionCircle, { backgroundColor: color + "12", borderColor: color + "30" }]}
    >
      {icon}
    </TouchableOpacity>
  );
}

interface DetailRowProps {
  label: string;
  value: string | number | undefined | null;
  icon?: React.ReactNode;
  theme: any;
  isLast?: boolean;
}

function DetailRow({ label, value, icon, theme, isLast }: DetailRowProps) {
  if (!value) return null;
  return (
    <View style={[styles.detailRow, !isLast && { borderBottomColor: theme.divider, borderBottomWidth: 1 }]}>
      <View style={styles.detailLabelRow}>
        {icon && <View style={styles.miniIconWrapper}>{icon}</View>}
        <Text style={[styles.detailLabel, { color: theme.textMute }]}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color: theme.text }]}>{String(value)}</Text>
    </View>
  );
}

interface StatusBadgeProps {
  isActive: boolean;
  activeText: string;
  inactiveText: string;
}

function StatusBadge({ isActive, activeText, inactiveText }: StatusBadgeProps) {
  const color = isActive ? "#10B981" : "#EF4444";
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + "15", borderColor: color + "30" }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{isActive ? activeText : inactiveText}</Text>
    </View>
  );
}

interface CustomerDetailContentProps {
  customer: CustomerDto | undefined;
  insets: { bottom: number };
  t: (key: string) => string;
}

export function CustomerDetailContent({ customer, insets, t }: CustomerDetailContentProps): React.ReactElement {
  const { themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const initials = getInitials(customer?.name || "");
  const avatarColor = getAvatarColor(customer?.name || ""); 

  const mainBg = isDark ? "#0c0516" : "#FFFFFF";
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.12)', 'transparent', 'rgba(249, 115, 22, 0.12)'] 
    : ['rgba(255, 240, 225, 0.6)', '#FFFFFF', 'rgba(255, 240, 225, 0.6)']) as [string, string, ...string[]];

  const THEME = {
    cardBg: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.95)",
    borderColor: "rgba(219, 39, 119, 0.3)", 
    divider: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
    text: isDark ? "#FFFFFF" : "#0F172A",
    textMute: isDark ? "rgba(255, 255, 255, 0.5)" : "#64748B",
    primary: "#db2777",
  };

  const handleMapOpen = () => {
    const address = `${customer?.address || ""} ${customer?.cityName || ""}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });
    Linking.openURL(url || "");
  };

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 160 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <View style={[styles.avatarWrapper, { borderColor: `${avatarColor}40` }]}>
            <LinearGradient colors={[`${avatarColor}40`, `${avatarColor}10`]} style={styles.avatarInner}>
                <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
            </LinearGradient>
          </View>
          <View style={styles.kunyeInfo}>
            <Text style={[styles.customerNameLarge, { color: THEME.text }]}>{customer?.name}</Text>
            <View style={styles.idTagCentered}>
              <Text style={styles.codeTagTextLarge}>#{customer?.customerCode || '---'}</Text>
            </View>
            <View style={styles.quickActionsRow}>
              {customer?.phone && (
                <ActionButton color="#6366f1" icon={<Call02Icon size={22} color="#6366f1" variant="stroke" />} onPress={() => Linking.openURL(`tel:${customer?.phone}`)} />
              )}
              {customer?.phone && (
                <ActionButton color="#25D366" icon={<WhatsappIcon size={22} color="#25D366" variant="stroke" />} onPress={() => Linking.openURL(`https://wa.me/${customer?.phone?.replace(/\D/g, "")}`)} />
              )}
              {customer?.email && (
                <ActionButton color="#3b82f6" icon={<Mail01Icon size={22} color="#3b82f6" variant="stroke" />} onPress={() => Linking.openURL(`mailto:${customer?.email}`)} />
              )}
              <ActionButton color="#ef4444" icon={<MapsCircle01Icon size={22} color="#ef4444" variant="stroke" />} onPress={handleMapOpen} />
            </View>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <View style={styles.sectionHeader}>
            <Contact01Icon size={18} color={THEME.primary} variant="stroke" />
            <Text style={[styles.sectionTitle, { color: THEME.text }]}>İLETİŞİM BİLGİLERİ</Text>
          </View>
          <DetailRow theme={THEME} label="Telefon" value={customer?.phone} icon={<Call02Icon size={14} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label="E-Posta" value={customer?.email} icon={<Mail01Icon size={14} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label="Web Sitesi" value={customer?.website} icon={<Globe02Icon size={14} color={THEME.textMute} />} isLast />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <View style={styles.sectionHeader}>
            <Location01Icon size={18} color={THEME.primary} variant="stroke" />
            <Text style={[styles.sectionTitle, { color: THEME.text }]}>ADRES & KONUM</Text>
          </View>
          <Text style={[styles.addressText, { color: THEME.text }]}>{customer?.address || 'Adres bilgisi girilmemiş.'}</Text>
          <View style={styles.locationGrid}>
            <View style={styles.locItem}>
              <Text style={[styles.gridLabel, { color: THEME.textMute }]}>Şehir / İlçe</Text>
              <Text style={[styles.gridValue, { color: THEME.text }]}>{customer?.cityName || '---'} / {customer?.districtName || '---'}</Text>
            </View>
            <View style={styles.locItem}>
              <Text style={[styles.gridLabel, { color: THEME.textMute }]}>Ülke</Text>
              <Text style={[styles.gridValue, { color: THEME.text }]}>{customer?.countryName || 'Türkiye'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.gridCard, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
             <Coins01Icon size={20} color="#10B981" style={{marginBottom: 8}} variant="stroke" />
             <Text style={[styles.gridLabel, { color: THEME.textMute }]}>Kredi Limiti</Text>
             <Text style={[styles.gridValue, { color: "#10B981", fontSize: 16 }]}>{formatCurrency(customer?.creditLimit) || '₺0,00'}</Text>
          </View>
          <View style={[styles.gridCard, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
             <Invoice01Icon size={20} color={THEME.primary} style={{marginBottom: 8}} variant="stroke" />
             <Text style={[styles.gridLabel, { color: THEME.textMute }]}>Vergi No</Text>
             <Text style={[styles.gridValue, { color: THEME.text, fontSize: 16 }]}>{customer?.taxNumber || '---'}</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <View style={styles.sectionHeader}>
            <Activity01Icon size={18} color={THEME.primary} variant="stroke" />
            <Text style={[styles.sectionTitle, { color: THEME.text }]}>SİSTEM DURUMU</Text>
          </View>
          <View style={styles.statusContainer}>
             <StatusBadge isActive={!!customer?.isCompleted} activeText="Tamamlandı" inactiveText="Beklemede" />
             {customer?.isPendingApproval && (
                <View style={styles.pendingBadge}><Text style={styles.pendingText}>Onay Bekliyor</Text></View>
             )}
          </View>
          <DetailRow theme={THEME} label="Onay Durumu" value={customer?.approvalStatus} icon={<Shield02Icon size={14} color={THEME.textMute} />} isLast />
        </View>

        <View style={[styles.footerCard, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
           <View style={styles.footerRow}>
             <UserIcon size={14} color={THEME.textMute} />
             <Text style={[styles.footerText, { color: THEME.textMute }]}>
                Oluşturan: <Text style={{color: THEME.text, fontWeight: '700'}}>{customer?.createdByFullUser || 'Sistem'}</Text>
             </Text>
           </View>
           <View style={[styles.footerRow, { marginTop: 4 }]}>
             <Calendar03Icon size={14} color={THEME.textMute} />
             <Text style={[styles.footerText, { color: THEME.textMute }]}>
                Tarih: <Text style={{color: THEME.text, fontWeight: '700'}}>{formatDate(customer?.createdDate)}</Text>
             </Text>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, backgroundColor: 'transparent' },
  profileCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 32,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatarInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: '800' },
  kunyeInfo: { alignItems: 'center', width: '100%' },
  customerNameLarge: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 },
  idTagCentered: { backgroundColor: 'rgba(0,0,0,0.12)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginBottom: 20 },
  codeTagTextLarge: { color: '#AAA', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  quickActionsRow: { flexDirection: 'row', gap: 18, justifyContent: 'center', width: '100%' },
  actionCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  sectionCard: { padding: 16, borderRadius: 24, borderWidth: 1.5, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center' },
  miniIconWrapper: { marginRight: 8, opacity: 0.7 },
  detailLabel: { fontSize: 13, fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  addressText: { fontSize: 14, lineHeight: 22, marginBottom: 12, opacity: 0.9 },
  locationGrid: { flexDirection: 'row', gap: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  locItem: { flex: 1 },
  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  gridCard: { flex: 1, padding: 16, borderRadius: 24, borderWidth: 1.5 },
  gridLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  gridValue: { fontWeight: '800' },
  statusContainer: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  pendingBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  pendingText: { color: '#F59E0B', fontSize: 11, fontWeight: '700' },
  notesText: { fontSize: 13, lineHeight: 20, opacity: 0.9 },
  footerCard: { padding: 16, borderRadius: 24, borderWidth: 1.5, marginTop: 12 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerText: { fontSize: 12, fontWeight: '500' },
});