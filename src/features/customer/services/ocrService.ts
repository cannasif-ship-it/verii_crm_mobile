import { Platform } from "react-native";
import TextRecognition from "@react-native-ml-kit/text-recognition";

async function visionOCR(imageUri: string): Promise<string> {
  const result = await TextRecognition.recognize(imageUri);
  return result?.text ?? "";
}

async function mlKitOCR(imageUri: string): Promise<string> {
  const result = await TextRecognition.recognize(imageUri);
  return result?.text ?? "";
}

export async function runOCR(imageUri: string): Promise<string> {
  if (!imageUri || typeof imageUri !== "string") {
    return "";
  }
  try {
    if (Platform.OS === "ios") {
      return await visionOCR(imageUri);
    }
    if (Platform.OS === "android") {
      return await mlKitOCR(imageUri);
    }
    return "";
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(
      message.includes("native") || message.includes("linking")
        ? "OCR için geliştirme build gerekli. Expo Go desteklenmez."
        : `OCR hatası: ${message}`
    );
  }
}
