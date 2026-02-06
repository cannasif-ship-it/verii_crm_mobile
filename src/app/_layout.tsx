import React, { useEffect } from "react";
import { LogBox, View } from "react-native";
import { Stack, usePathname } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { ToastContainer } from "../components/Toast";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/auth";
import { Sidebar } from "../components/navigation/Sidebar";
import { AppHeader } from "../components/navigation/AppHeader";
import { initLanguage } from "../locales";
import "../locales";
import "../../global.css";

LogBox.ignoreLogs([
  "key\" prop is being spread",
  "being spread into JSX",
  "React keys must be passed directly",
]);

export default function RootLayout(): React.ReactElement {
  const hydrate = useAuthStore((state) => state.hydrate);
  const pathname = usePathname();

  useEffect(() => {
    hydrate();
    initLanguage();
  }, [hydrate]);

  // Auth (Login) ekranlarında AppHeader'ı gizle
  const isAuthScreen = pathname.includes("/(auth)") || pathname === "/login";

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider>
            
            {/* TÜM UYGULAMA YAPISI 
              AppHeader en üstte sabit, Stack altında değişen içerik.
            */}
            <View style={{ flex: 1 }}>
              
              {/* Login değilse Header'ı göster */}
              {!isAuthScreen && <AppHeader />} 

              {/* Sayfa İçerikleri */}
              <Stack screenOptions={{ headerShown: false }} />
            
            </View>

            {/* Sidebar ve Toast en üst katmanda */}
            <Sidebar />
            <ToastContainer />
            
          </GluestackUIProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}