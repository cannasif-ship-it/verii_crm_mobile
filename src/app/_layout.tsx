import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { ToastContainer } from "../components/Toast";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/auth";
import { initLanguage } from "../locales";
import "../locales";
import "../../global.css";

export default function RootLayout(): React.ReactElement {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
    initLanguage();
  }, [hydrate]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <GluestackUIProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <ToastContainer />
          </GluestackUIProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
