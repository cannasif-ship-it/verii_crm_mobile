import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "../../../components/ui/text";
import type { CustomerDto } from "../types";
// UI Store'u içe aktar
import { useUIStore } from "../../../store/ui"; 
// HugeIcons
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

// --- YARDIMCI FONKSİYONLAR ---
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

// --- BİLEŞENLER ---

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
  // Açık modda arka plan rengini biraz daha belirgin yapalım
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
  colors: Record<string, string>; // Props'tan gelse de store kullanacağız
  insets: { bottom: number };
  t: (key: string) => string;
}

export function CustomerDetailContent({ customer, insets, t }: CustomerDetailContentProps): React.ReactElement {
  
  // --- DİNAMİK TEMA ---
  const { colors, themeMode } = useUIStore();
  const isDark = themeMode === "dark";

  const THEME = {
    isDark,
    bg: isDark ? "#1a0b2e" : colors.background, // Koyu mor / Beyaz
    cardBg: isDark ? "#1e1b29" : colors.card,   // Koyu kart / Açık kart
    borderColor: isDark ? "rgba(255,255,255,0.08)" : colors.border,
    divider: isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0",
    text: isDark ? "#FFFFFF" : colors.text,
    textMute: isDark ? "#94a3b8" : colors.textMuted,
    primary: "#db2777",
    
    // Badge Renkleri (Açık modda daha soft)
    badgeBg: isDark ? "rgba(219, 39, 119, 0.1)" : "#FCE7F3",
    badgeText: "#db2777",
    
    yearBadgeBg: isDark ? "rgba(147, 51, 234, 0.1)" : "#F3E8FF",
    yearBadgeText: "#9333ea"
  };

  const initials = getInitials(customer?.name || "");
  const avatarColor = getAvatarColor(customer?.name || "");

  const locationParts: string[] = [];
  if (customer?.countryName) locationParts.push(customer.countryName);
  if (customer?.cityName) locationParts.push(customer.cityName);
  if (customer?.districtName) locationParts.push(customer.districtName);
  const locationString = locationParts.join(", ");

  const hasContactInfo = customer?.phone || customer?.phone2 || customer?.email || customer?.website;
  const hasLocationInfo = customer?.address || locationParts.length > 0;
  const hasTaxInfo = customer?.taxNumber || customer?.taxOffice || customer?.tcknNumber;
  const hasBusinessInfo = customer?.salesRepCode || customer?.groupCode || customer?.creditLimit !== undefined;
  const hasApprovalInfo = customer?.approvalStatus || customer?.isPendingApproval || customer?.isCompleted !== undefined || customer?.rejectedReason;
  const hasERPInfo = customer?.erpIntegrationNumber || customer?.isERPIntegrated !== undefined || customer?.lastSyncDate;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: THEME.bg }]}
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      
      {/* --- HEADER KARTI --- */}
      <View style={[styles.card, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
        <View style={styles.headerContent}>
          <View style={[styles.avatar, { backgroundColor: `${avatarColor}15`, borderColor: `${avatarColor}30` }]}>
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

      {/* --- İLETİŞİM --- */}
      {hasContactInfo && (
        <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: THEME.text }]}>{t("customer.contactInfo")}</Text>
          <DetailRow theme={THEME} label={t("customer.phone")} value={customer?.phone} icon={<Call02Icon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={t("customer.phone2")} value={customer?.phone2} icon={<Call02Icon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={t("customer.email")} value={customer?.email} icon={<Mail01Icon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={t("customer.website")} value={customer?.website} icon={<Globe02Icon size={16} color={THEME.textMute} />} />
        </View>
      )}

      {/* --- LOKASYON --- */}
      {hasLocationInfo && (
        <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: THEME.text }]}>{t("lookup.location")}</Text>
          <DetailRow theme={THEME} label={t("customer.address")} value={customer?.address} icon={<Location01Icon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={t("lookup.country")} value={customer?.countryName} />
          <DetailRow theme={THEME} label={t("lookup.city")} value={customer?.cityName} />
          <DetailRow theme={THEME} label={t("lookup.district")} value={customer?.districtName} />
        </View>
      )}

      {/* --- FİNANSAL --- */}
      {hasBusinessInfo && (
        <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: THEME.text }]}>{t("customer.businessInfo")}</Text>
          <DetailRow theme={THEME} label={t("customer.salesRepCode")} value={customer?.salesRepCode} icon={<UserIcon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={t("customer.groupCode")} value={customer?.groupCode} icon={<UserGroupIcon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={t("customer.creditLimit")} value={formatCurrency(customer?.creditLimit)} icon={<Coins01Icon size={16} color="#10b981" />} />
          <DetailRow theme={THEME} label={t("customer.branchCode")} value={String(customer?.branchCode)} />
          <DetailRow theme={THEME} label={t("customer.businessUnitCode")} value={String(customer?.businessUnitCode)} />
        </View>
      )}

      {/* --- VERGİ --- */}
      {hasTaxInfo && (
        <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: THEME.text }]}>{t("customer.taxInfo")}</Text>
          <DetailRow theme={THEME} label={t("customer.taxNumber")} value={customer?.taxNumber} icon={<Invoice01Icon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={t("customer.taxOffice")} value={customer?.taxOffice} icon={<Building03Icon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={t("customer.tcknNumber")} value={customer?.tcknNumber} icon={<CreditCardIcon size={16} color={THEME.textMute} />} />
        </View>
      )}

      {/* --- ONAY --- */}
      {hasApprovalInfo && (
        <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: THEME.text }]}>{t("customer.approvalInfo")}</Text>
          
          <View style={styles.badgeRow}>
             {customer?.isCompleted !== undefined && (
                <StatusBadge 
                  theme={THEME}
                  isActive={customer.isCompleted} 
                  activeText={t("customer.statusCompleted")} 
                  inactiveText={t("customer.statusPending")} 
                />
             )}
             {customer?.isPendingApproval && (
                <View style={[styles.pendingBadge, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#FEF3C7" }]}>
                   <Text style={[styles.pendingText, { color: "#F59E0B" }]}>{t("customer.isPendingApproval")}</Text>
                </View>
             )}
          </View>

          <DetailRow theme={THEME} label={t("customer.approvalStatus")} value={customer?.approvalStatus} icon={<Shield02Icon size={16} color={THEME.textMute} />} />
          <DetailRow theme={THEME} label={t("customer.approvalDate")} value={formatDate(customer?.approvalDate)} />
          <DetailRow theme={THEME} label={t("customer.completionDate")} value={formatDate(customer?.completionDate)} />
          <DetailRow theme={THEME} label={t("customer.rejectedReason")} value={customer?.rejectedReason} />
        </View>
      )}

      {/* --- ERP --- */}
      {hasERPInfo && (
        <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <Text style={[styles.sectionTitle, { color: THEME.text }]}>{t("customer.erpIntegration")}</Text>
          
          <DetailRow theme={THEME} label={t("customer.erpIntegrationNumber")} value={customer?.erpIntegrationNumber} icon={<ComputerIcon size={16} color={THEME.textMute} />} />
          
          {customer?.isERPIntegrated !== undefined && (
             <View style={[styles.detailRow, { borderBottomColor: THEME.divider }]}>
                <View style={styles.detailLabelRow}>
                   <View style={styles.iconWrapper}><ComputerIcon size={16} color={THEME.textMute} /></View>
                   <Text style={[styles.detailLabel, { color: THEME.textMute }]}>{t("customer.isERPIntegrated")}</Text>
                </View>
                <StatusBadge theme={THEME} isActive={customer.isERPIntegrated} activeText={t("customer.statusYes")} inactiveText={t("customer.statusNo")} />
             </View>
          )}
          
          <DetailRow theme={THEME} label={t("customer.lastSyncDate")} value={formatDate(customer?.lastSyncDate)} />
        </View>
      )}

      {/* --- NOTLAR --- */}
      {customer?.notes && (
        <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
          <View style={styles.detailLabelRow}>
             <Note01Icon size={16} color={THEME.textMute} style={{marginRight: 8}} />
             <Text style={[styles.sectionTitle, { color: THEME.text, marginBottom: 0 }]}>{t("customer.notes")}</Text>
          </View>
          <Text style={[styles.notesText, { color: THEME.textMute }]}>{customer.notes}</Text>
        </View>
      )}

      {/* --- SİSTEM --- */}
      <View style={[styles.section, { backgroundColor: THEME.cardBg, borderColor: THEME.borderColor }]}>
        <Text style={[styles.sectionTitle, { color: THEME.text }]}>{t("customer.systemInfo")}</Text>
        <DetailRow theme={THEME} label={t("customer.createdBy")} value={customer?.createdByFullUser} icon={<UserIcon size={16} color={THEME.textMute} />} />
        <DetailRow theme={THEME} label={t("customer.createdDate")} value={formatDate(customer?.createdDate)} icon={<Calendar03Icon size={16} color={THEME.textMute} />} />
        <DetailRow theme={THEME} label={t("customer.updatedBy")} value={customer?.updatedByFullUser} icon={<UserIcon size={16} color={THEME.textMute} />} />
        <DetailRow theme={THEME} label={t("customer.updatedDate")} value={formatDate(customer?.updatedDate)} icon={<Calendar03Icon size={16} color={THEME.textMute} />} />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerContent: { alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarText: { fontSize: 28, fontWeight: "bold" },
  customerName: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  customerCode: { fontSize: 14, fontFamily: "monospace", opacity: 0.7, marginBottom: 16 },
  
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  pendingBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  pendingText: { fontSize: 12, fontWeight: "600" },

  section: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    opacity: 0.9,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { marginRight: 10, opacity: 0.7 },
  detailLabel: { fontSize: 14, fontWeight: "500" },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    maxWidth: '60%',
    textAlign: 'right',
  },
  notesText: { marginTop: 12, fontSize: 14, lineHeight: 22 },
});