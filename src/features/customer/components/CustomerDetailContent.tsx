import React from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
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
  UserGroupIcon, 
  CheckmarkCircle02Icon, 
  AlertCircleIcon,
  Calendar03Icon,
  Note01Icon,
  Building03Icon,
  ComputerIcon,
  UserIcon,
  CreditCardIcon,
  Shield02Icon
} from "hugeicons-react-native";

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

function formatDate(dateString: string | undefined | null): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(value: number | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value);
}

function DetailRow({ label, value, icon, theme }: { label: string; value: string | undefined | null; icon?: React.ReactNode, theme: any }) {
  if (!value) return null;
  return (
    <View style={[styles.detailRow, { borderBottomColor: theme.divider }]}>
      <View style={styles.detailLabelRow}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={[styles.detailLabel, { color: theme.textMute }]}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function StatusBadge({ isActive, activeText, inactiveText, theme }: { isActive: boolean; activeText: string; inactiveText: string, theme: any }) {
  const color = isActive ? "#10B981" : "#EF4444";
  const bgColor = isActive 
    ? (theme.isDark ? "rgba(16, 185, 129, 0.1)" : "#D1FAE5") 
    : (theme.isDark ? "rgba(239, 68, 68, 0.1)" : "#FEE2E2");
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor, borderColor: theme.isDark ? color + "40" : "transparent" }]}>
      {isActive ? <CheckmarkCircle02Icon size={14} color={color} variant="stroke" /> : <AlertCircleIcon size={14} color={color} variant="stroke" />}
      <Text style={[styles.statusText, { color }]}>{isActive ? activeText : inactiveText}</Text>
    </View>
  );
}

interface CustomerDetailContentProps {
  customer: CustomerDto | undefined;
  colors: Record<string, string>;
  insets: { bottom: number };
  t: (key: string) => string;
}

export function CustomerDetailContent({ customer, insets, t }: CustomerDetailContentProps): React.ReactElement {
  const { colors, themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const mainBg = isDark ? "#0c0516" : "#FFFFFF";
  const gradientColors = (isDark
    ? ['rgba(236, 72, 153, 0.12)', 'transparent', 'rgba(249, 115, 22, 0.12)'] 
    : ['rgba(255, 235, 240, 0.6)', '#FFFFFF', 'rgba(255, 240, 225, 0.6)']) as [string, string, ...string[]];

  const THEME = {
    isDark,
    bg: "transparent",
    cardBg: isDark ? "rgba(30, 27, 41, 0.5)" : "rgba(255, 255, 255, 0.8)",
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    divider: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
    text: isDark ? "#FFFFFF" : colors.text,
    textMute: isDark ? "#94a3b8" : colors.textMuted,
    primary: "#db2777",
    badgeBg: isDark ? "rgba(219, 39, 119, 0.15)" : "#FCE7F3",
    badgeText: "#db2777",
    yearBadgeBg: isDark ? "rgba(147, 51, 234, 0.15)" : "#F3E8FF",
    yearBadgeText: "#9333ea"
  };

  const safeT = (key: string, fallback: string) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  const initials = getInitials(customer?.name || "");
  const avatarColor = getAvatarColor(customer?.name || "");

  const locationParts: string[] = [];
  if (customer?.countryName) locationParts.push(customer.countryName);
  if (customer?.cityName) locationParts.push(customer.cityName);
  if (customer?.districtName) locationParts.push(customer.districtName);

  const hasContactInfo = customer?.phone || customer?.phone2 || customer?.email || customer?.website;
  const hasLocationInfo = customer?.address || locationParts.length > 0;
  const hasTaxInfo = customer?.taxNumber || customer?.taxOffice || customer?.tcknNumber;
  const hasBusinessInfo = customer?.salesRepCode || customer?.groupCode || customer?.creditLimit !== undefined;
  const hasApprovalInfo = customer?.approvalStatus || customer?.isPendingApproval || customer?.isCompleted !== undefined || customer?.rejectedReason;
  const hasERPInfo = customer?.erpIntegrationNumber || customer?.isERPIntegrated !== undefined || customer?.lastSyncDate;

  return (
    <View style={[styles.container, { backgroundColor: mainBg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <View style={styles.headerContent}>
            <View style={[styles.avatar, { backgroundColor: `${avatarColor}20`, borderColor: `${avatarColor}40` }]}>
              <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
            </View>
            <Text style={[styles.customerName, { color: THEME.text }]}>{customer?.name}</Text>
            {customer?.customerCode && (
               <Text style={[styles.customerCode, { color: THEME.textMute }]}>#{customer.customerCode}</Text>
            )}
            <View style={styles.badgeRow}>
              {customer?.customerTypeName && (
                <View style={[styles.badge, { backgroundColor: THEME.badgeBg }]}>
                  <Text style={[styles.badgeText, { color: THEME.badgeText }]}>{customer.customerTypeName}</Text>
                </View>
              )}
              {customer?.year && (
                 <View style={[styles.badge, { backgroundColor: THEME.yearBadgeBg }]}>
                    <Text style={[styles.badgeText, { color: THEME.yearBadgeText }]}>{customer.year}</Text>
                 </View>
              )}
            </View>
          </View>
        </View>

        {hasContactInfo && (
          <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
            <Text style={[styles.sectionTitle, { color: THEME.primary }]}>{safeT("customer.contactInfo", "İLETİŞİM BİLGİLERİ")}</Text>
            <DetailRow theme={THEME} label={safeT("customer.phone", "Telefon")} value={customer?.phone} icon={<Call02Icon size={16} color={THEME.textMute} />} />
            <DetailRow theme={THEME} label={safeT("customer.phone2", "Telefon 2")} value={customer?.phone2} icon={<Call02Icon size={16} color={THEME.textMute} />} />
            <DetailRow theme={THEME} label={safeT("customer.email", "E-Posta")} value={customer?.email} icon={<Mail01Icon size={16} color={THEME.textMute} />} />
            <DetailRow theme={THEME} label={safeT("customer.website", "Web Sitesi")} value={customer?.website} icon={<Globe02Icon size={16} color={THEME.textMute} />} />
          </View>
        )}

        {hasLocationInfo && (
          <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
            <Text style={[styles.sectionTitle, { color: THEME.primary }]}>{safeT("lookup.location", "ADRES BİLGİLERİ")}</Text>
            <DetailRow theme={THEME} label={safeT("customer.address", "Adres")} value={customer?.address} icon={<Location01Icon size={16} color={THEME.textMute} />} />
            <DetailRow theme={THEME} label={safeT("lookup.country", "Ülke")} value={customer?.countryName} />
            <DetailRow theme={THEME} label={safeT("lookup.city", "Şehir")} value={customer?.cityName} />
            <DetailRow theme={THEME} label={safeT("lookup.district", "İlçe")} value={customer?.districtName} />
          </View>
        )}

        {hasBusinessInfo && (
          <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
            <Text style={[styles.sectionTitle, { color: THEME.primary }]}>{safeT("customer.businessInfo", "TİCARİ BİLGİLER")}</Text>
            <DetailRow theme={THEME} label={safeT("customer.salesRepCode", "Satış Temsilcisi")} value={customer?.salesRepCode} icon={<UserIcon size={16} color={THEME.textMute} />} />
            <DetailRow theme={THEME} label={safeT("customer.groupCode", "Grup Kodu")} value={customer?.groupCode} icon={<UserGroupIcon size={16} color={THEME.textMute} />} />
            <DetailRow theme={THEME} label={safeT("customer.creditLimit", "Kredi Limiti")} value={formatCurrency(customer?.creditLimit)} icon={<Coins01Icon size={16} color="#10b981" />} />
            <DetailRow theme={THEME} label={safeT("customer.branchCode", "Şube Kodu")} value={customer?.branchCode ? String(customer.branchCode) : null} />
          </View>
        )}

        {hasTaxInfo && (
          <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
            <Text style={[styles.sectionTitle, { color: THEME.primary }]}>{safeT("customer.taxInfo", "VERGİ BİLGİLERİ")}</Text>
            <DetailRow theme={THEME} label={safeT("customer.taxNumber", "Vergi Numarası")} value={customer?.taxNumber} icon={<Invoice01Icon size={16} color={THEME.textMute} />} />
            <DetailRow theme={THEME} label={safeT("customer.taxOffice", "Vergi Dairesi")} value={customer?.taxOffice} icon={<Building03Icon size={16} color={THEME.textMute} />} />
            <DetailRow theme={THEME} label={safeT("customer.tcknNumber", "TCKN")} value={customer?.tcknNumber} icon={<CreditCardIcon size={16} color={THEME.textMute} />} />
          </View>
        )}

        {hasApprovalInfo && (
          <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
            <Text style={[styles.sectionTitle, { color: THEME.primary }]}>{safeT("customer.approvalInfo", "ONAY BİLGİLERİ")}</Text>
            <View style={styles.badgeRow}>
               {customer?.isCompleted !== undefined && (
                  <StatusBadge 
                    theme={THEME}
                    isActive={customer.isCompleted} 
                    activeText={safeT("customer.statusCompleted", "Tamamlandı")} 
                    inactiveText={safeT("customer.statusPending", "Beklemede")} 
                  />
               )}
               {customer?.isPendingApproval && (
                  <View style={[styles.pendingBadge, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" }]}>
                     <Text style={[styles.pendingText, { color: "#F59E0B" }]}>{safeT("customer.isPendingApproval", "Onay Bekliyor")}</Text>
                  </View>
               )}
            </View>
            <DetailRow theme={THEME} label={safeT("customer.approvalStatus", "Onay Durumu")} value={customer?.approvalStatus} icon={<Shield02Icon size={16} color={THEME.textMute} />} />
            <DetailRow theme={THEME} label={safeT("customer.approvalDate", "Onay Tarihi")} value={formatDate(customer?.approvalDate)} />
            <DetailRow theme={THEME} label={safeT("customer.rejectedReason", "Red Nedeni")} value={customer?.rejectedReason} />
          </View>
        )}

        {hasERPInfo && (
          <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
            <Text style={[styles.sectionTitle, { color: THEME.primary }]}>{safeT("customer.erpIntegration", "ERP ENTEGRASYONU")}</Text>
            <DetailRow theme={THEME} label={safeT("customer.erpIntegrationNumber", "ERP No")} value={customer?.erpIntegrationNumber} icon={<ComputerIcon size={16} color={THEME.textMute} />} />
            {customer?.isERPIntegrated !== undefined && (
               <View style={[styles.detailRow, { borderBottomColor: THEME.divider }]}>
                  <View style={styles.detailLabelRow}>
                     <View style={styles.iconWrapper}><ComputerIcon size={16} color={THEME.textMute} /></View>
                     <Text style={[styles.detailLabel, { color: THEME.textMute }]}>{safeT("customer.isERPIntegrated", "ERP Entegre")}</Text>
                  </View>
                  <StatusBadge theme={THEME} isActive={customer.isERPIntegrated} activeText={safeT("customer.statusYes", "Evet")} inactiveText={safeT("customer.statusNo", "Hayır")} />
               </View>
            )}
            <DetailRow theme={THEME} label={safeT("customer.lastSyncDate", "Son Senkronizasyon")} value={formatDate(customer?.lastSyncDate)} />
          </View>
        )}

        {customer?.notes && (
          <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
            <View style={styles.detailLabelRow}>
               <Note01Icon size={16} color={THEME.textMute} style={{marginRight: 8}} />
               <Text style={[styles.sectionTitle, { color: THEME.primary, marginBottom: 0 }]}>{safeT("customer.notes", "NOTLAR")}</Text>
            </View>
            <Text style={[styles.notesText, { color: THEME.text }]}>{customer.notes}</Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: THEME.primary }]}>{safeT("customer.systemInfo", "SİSTEM BİLGİLERİ")}</Text>
          <DetailRow theme={THEME} label={safeT("customer.createdBy", "Oluşturan")} value={customer?.createdByFullUser} icon={<UserIcon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={safeT("customer.createdDate", "Oluşturulma")} value={formatDate(customer?.createdDate)} icon={<Calendar03Icon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={safeT("customer.updatedBy", "Güncelleyen")} value={customer?.updatedByFullUser} icon={<UserIcon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={safeT("customer.updatedDate", "Güncellenme")} value={formatDate(customer?.updatedDate)} icon={<Calendar03Icon size={16} color={THEME.textMute} />} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, backgroundColor: 'transparent' },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 2 }
    })
  },
  headerContent: { alignItems: 'center' },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  avatarText: { fontSize: 30, fontWeight: "800" },
  customerName: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 4 },
  customerCode: { fontSize: 13, fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }), opacity: 0.6, marginBottom: 16 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  pendingBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  pendingText: { fontSize: 11, fontWeight: "700" },
  section: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 18,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { marginRight: 10, opacity: 0.8 },
  detailLabel: { fontSize: 13, fontWeight: "600" },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    maxWidth: '65%',
    textAlign: 'right',
  },
  notesText: { marginTop: 12, fontSize: 14, lineHeight: 22, opacity: 0.9 },
});