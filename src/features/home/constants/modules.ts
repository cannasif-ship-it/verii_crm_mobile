import type { Module } from "../types";

export const CRM_MODULES: Module[] = [
  {
    id: "1",
    key: "customers",
    icon: "👥",
    color: "#3B82F6",
    route: "/(tabs)/customers",
  },
  {
    id: "2",
    key: "activities",
    icon: "📅",
    color: "#10B981",
    route: "/(tabs)/activities",
  },
  {
    id: "3",
    key: "sales",
    icon: "💰",
    color: "#F59E0B",
    route: "/(tabs)/sales",
  },
  {
    id: "4",
    key: "stock",
    icon: "📦",
    color: "#8B5CF6",
    route: "/(tabs)/stock",
  },
];
