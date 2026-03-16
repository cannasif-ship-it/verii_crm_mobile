import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";

function normalizeFileUri(fileUri: string): string {
  return fileUri.startsWith("file://") ? fileUri : `file://${fileUri}`;
}

export function canPreviewPdfInApp(): boolean {
  return Platform.OS !== "android";
}

export async function openPdfExternallyAsync(
  fileUri: string
): Promise<{ opened: boolean; reason?: "no_app" | "unsupported" | "unknown" }> {
  try {
    const normalizedUri = normalizeFileUri(fileUri);

    if (Platform.OS !== "android") {
      return { opened: false, reason: "unsupported" };
    }

    const contentUri = await FileSystem.getContentUriAsync(normalizedUri);

    await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: contentUri,
      type: "application/pdf",
      flags: 1,
    });

    return { opened: true };
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (
      message.includes("activity not found") ||
      message.includes("no activity") ||
      message.includes("no application")
    ) {
      return { opened: false, reason: "no_app" };
    }

    return { opened: false, reason: "unknown" };
  }
}
