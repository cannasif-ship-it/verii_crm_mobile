import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { runOCR } from "../services/ocrService";
import { parseBusinessCardText } from "../utils/parseBusinessCardText";
import type { BusinessCardOcrResult } from "../types/businessCard";

export function useBusinessCardScan(): {
  scanBusinessCard: (onResult: (data: BusinessCardOcrResult) => void) => Promise<void>;
  isScanning: boolean;
  error: string | null;
} {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanBusinessCard = useCallback(
    async (onResult: (data: BusinessCardOcrResult) => void): Promise<void> => {
      setError(null);
      setIsScanning(true);
      try {
        let status = await ImagePicker.getCameraPermissionsAsync();
        if (!status.granted) {
          status = await ImagePicker.requestCameraPermissionsAsync();
        }
        if (!status.granted) {
          setError("Kamera erişim izni verilmedi.");
          setIsScanning(false);
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.85,
        });

        if (result.canceled || !result.assets?.[0]) {
          setIsScanning(false);
          return;
        }

        const imageUri = result.assets[0].uri;
        if (!imageUri) {
          setError("Görüntü alınamadı.");
          setIsScanning(false);
          return;
        }

        const text = await runOCR(imageUri);
        if (!text || !text.trim()) {
          setError("Kartvizitten metin alınamadı. Görüntüyü net çekip tekrar deneyin.");
          setIsScanning(false);
          return;
        }

        const parsed = parseBusinessCardText(text.trim());
        onResult(parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kartvizit tarama başarısız.");
      } finally {
        setIsScanning(false);
      }
    },
    []
  );

  return { scanBusinessCard, isScanning, error };
}
