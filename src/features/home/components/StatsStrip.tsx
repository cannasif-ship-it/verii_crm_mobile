import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../../../components/ui/text";
import {
  PackageIcon,
  TruckIcon,
  AlarmClockIcon,
} from "hugeicons-react-native";
import { useUIStore } from "../../../store/ui";

const ACCENT = "#E84855";

interface StatsStripProps {
  todayReceiving: number;
  todayShipping: number;
  pendingTasks: number;
}

function StatItem({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  value: number;
  label: string;
  color: string;
}): React.ReactElement {
  return (
    <View className="flex-1 rounded-2xl border border-app-cardBorder dark:border-app-cardBorderDark bg-app-card dark:bg-app-cardDark py-4 px-3 items-center min-w-0">
      <View className="w-10 h-10 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: `${color}18` }}>
        <Icon size={20} color={color} />
      </View>
      <Text className="text-xl font-bold text-app-text dark:text-app-textDark" numberOfLines={1}>
        {value}
      </Text>
      <Text className="text-[11px] text-app-textSecondary dark:text-app-textSecondaryDark mt-0.5" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function StatsStrip({ todayReceiving, todayShipping, pendingTasks }: StatsStripProps): React.ReactElement {
  const { t } = useTranslation();
  const { themeMode } = useUIStore();
  const muted = themeMode === "dark" ? "#64748B" : "#6B7280";

  return (
    <View className="flex-row gap-3 mb-6">
      <StatItem
        icon={PackageIcon}
        value={todayReceiving}
        label={t("home.todayReceiving")}
        color={ACCENT}
      />
      <StatItem
        icon={TruckIcon}
        value={todayShipping}
        label={t("home.todayShipping")}
        color="#10B981"
      />
      <StatItem
        icon={AlarmClockIcon}
        value={pendingTasks}
        label={t("home.pendingTasks")}
        color={muted}
      />
    </View>
  );
}
