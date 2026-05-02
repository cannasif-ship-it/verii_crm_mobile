import * as signalR from "@microsoft/signalr";
import { authAccessApi } from "../features/access-control/api/authAccessApi";
import { getSystemSettings } from "../features/system-settings/api/systemSettingsApi";
import { getApiBaseUrl } from "../constants/config";
import { queryClient } from "./queryClient";
import { applySystemLanguageIfNeeded } from "./systemSettings";
import { useAuthStore } from "../store/auth";
import { useSystemSettingsStore } from "../store/system-settings";

interface AccessControlChangedPayload {
  reason?: string;
  forceBootstrapRefresh?: boolean;
  issuedAt?: string;
}

const ACCESS_CONTROL_QUERY_ROOTS = new Set(["activity", "demand", "quotation", "order", "customer360"]);

class RealtimeAccessControlService {
  private hubConnection: signalR.HubConnection | null = null;
  private refreshPromise: Promise<void> | null = null;
  private connectionToken: string | null = null;

  async connect(token: string): Promise<void> {
    if (!token) {
      return;
    }

    if (this.hubConnection?.state === signalR.HubConnectionState.Connected && this.connectionToken === token) {
      return;
    }

    if (this.hubConnection && this.connectionToken !== token) {
      await this.disconnect();
    }

    const hubUrl = `${getApiBaseUrl()}/notificationHub?access_token=${encodeURIComponent(token)}`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const retry = retryContext.previousRetryCount;
          if (retry === 0) return 0;
          if (retry === 1) return 2000;
          if (retry === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connectionToken = token;

    this.hubConnection.on("AccessControlChanged", (payload: AccessControlChangedPayload) => {
      void this.handleAccessControlChanged(payload);
    });

    this.hubConnection.onclose(() => {
      this.hubConnection = null;
    });

    await this.hubConnection.start();
  }

  async disconnect(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }

    this.connectionToken = null;
  }

  private async handleAccessControlChanged(payload: AccessControlChangedPayload): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const { token, user, setPermissions } = useAuthStore.getState();
      if (!token || !user?.id) {
        return;
      }

      const [permissions, settings] = await Promise.all([
        authAccessApi.getMyPermissions(),
        getSystemSettings(),
      ]);

      await setPermissions(permissions);
      useSystemSettingsStore.getState().setSettings(settings);
      await applySystemLanguageIfNeeded();

      await queryClient.invalidateQueries({
        predicate: (query) => {
          const [root] = query.queryKey;
          return typeof root === "string" && ACCESS_CONTROL_QUERY_ROOTS.has(root);
        },
        refetchType: "active",
      });

      if (payload.forceBootstrapRefresh) {
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const [root] = query.queryKey;
            return typeof root === "string" && root === "user";
          },
          refetchType: "active",
        });
      }
    })().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }
}

export const realtimeAccessControlService = new RealtimeAccessControlService();
