import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { runOCR } from "../services/ocrService";
import { extractBusinessCardViaLLM } from "../services/businessCardLlmService";
import {
  repairJsonString,
  toBusinessCardOcrResult,
  validateAndNormalizeBusinessCardExtraction,
} from "../schemas/businessCardSchema";
import { parseBusinessCardText } from "../utils/parseBusinessCardText";
import type { BusinessCardOcrResult } from "../types/businessCard";

function fallbackToStructuredInput(parsed: BusinessCardOcrResult): {
  name: string | null;
  title: string | null;
  company: string | null;
  phones: string[];
  emails: string[];
  website: string | null;
  address: string | null;
  social: { linkedin: null; instagram: null; x: null; facebook: null };
  notes: string[];
} {
  return {
    name: parsed.customerName ?? null,
    title: null,
    company: parsed.customerName ?? null,
    phones: parsed.phone1 ? [parsed.phone1] : [],
    emails: parsed.email ? [parsed.email] : [],
    website: parsed.website ?? null,
    address: parsed.address ?? null,
    social: {
      linkedin: null,
      instagram: null,
      x: null,
      facebook: null,
    },
    notes: [],
  };
}

export function useBusinessCardScan(): {
  scanBusinessCard: (onResult: (data: BusinessCardOcrResult) => void) => Promise<void>;
  pickBusinessCardFromGallery: (onResult: (data: BusinessCardOcrResult) => void) => Promise<void>;
  isScanning: boolean;
  error: string | null;
} {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(
    async (imageUri: string, onResult: (data: BusinessCardOcrResult) => void): Promise<void> => {
      const text = await runOCR(imageUri);
      if (!text || !text.trim()) {
        setError("Kartvizitten metin alınamadı. Görüntüyü net çekip tekrar deneyin.");
        return;
      }

      const rawText = text.trim();
      let extractedByLlm = false;

      try {
        const llmRawOutput = await extractBusinessCardViaLLM(rawText);
        const repaired = repairJsonString(llmRawOutput);
        if (!repaired) {
          throw new Error("LLM JSON repair failed.");
        }

        const parsedJson = JSON.parse(repaired) as unknown;
        const normalized = validateAndNormalizeBusinessCardExtraction(parsedJson, rawText);
        onResult({
          ...toBusinessCardOcrResult(normalized),
          imageUri,
        });
        extractedByLlm = true;
      } catch {
        const parsed = parseBusinessCardText(rawText);
        const normalizedFallback = validateAndNormalizeBusinessCardExtraction(
          fallbackToStructuredInput(parsed),
          rawText
        );
        onResult({
          ...toBusinessCardOcrResult(normalizedFallback),
          imageUri,
        });
      }

      if (!extractedByLlm && __DEV__) {
        console.log("[BusinessCardScan] LLM extraction failed, regex fallback used.");
      }
    },
    []
  );

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

        await processImage(imageUri, onResult);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kartvizit tarama başarısız.");
      } finally {
        setIsScanning(false);
      }
    },
    [processImage]
  );

  const pickBusinessCardFromGallery = useCallback(
    async (onResult: (data: BusinessCardOcrResult) => void): Promise<void> => {
      setError(null);
      setIsScanning(true);
      try {
        let status = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (!status.granted) {
          status = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        if (!status.granted) {
          setError("Galeri erişim izni verilmedi.");
          setIsScanning(false);
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
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

        await processImage(imageUri, onResult);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kartvizit seçimi başarısız.");
      } finally {
        setIsScanning(false);
      }
    },
    [processImage]
  );

  return { scanBusinessCard, pickBusinessCardFromGallery, isScanning, error };
}
