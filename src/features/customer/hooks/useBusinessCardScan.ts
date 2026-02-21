import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { runOCR } from "../services/ocrService";
import { extractBusinessCardViaLLM } from "../services/businessCardLlmService";
import { buildBusinessCardCandidateHints } from "../services/businessCardHeuristics";
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
  scanBusinessCard: () => Promise<BusinessCardOcrResult | null>;
  pickBusinessCardFromGallery: () => Promise<BusinessCardOcrResult | null>;
  retryBusinessCardExtraction: (imageUri: string) => Promise<BusinessCardOcrResult | null>;
  isScanning: boolean;
  error: string | null;
} {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(
    async (imageUri: string): Promise<BusinessCardOcrResult | null> => {
      const ocr = await runOCR(imageUri);
      const rawText = (ocr.rawText || ocr.lines.join("\n")).trim();
      if (!rawText) {
        setError("Kartvizitten metin alınamadı. Görüntüyü net çekip tekrar deneyin.");
        return null;
      }

      const candidateHints = buildBusinessCardCandidateHints(rawText, ocr.lines);

      try {
        const llmRawOutput = await extractBusinessCardViaLLM({
          rawText,
          ocrLines: ocr.lines,
          candidateHints,
        });
        const repaired = repairJsonString(llmRawOutput);
        if (!repaired) {
          throw new Error("LLM JSON repair failed.");
        }

        const parsedJson = JSON.parse(repaired) as unknown;
        const normalized = validateAndNormalizeBusinessCardExtraction(
          parsedJson,
          rawText,
          ocr.lines,
          candidateHints.addressLines
        );
        return {
          ...toBusinessCardOcrResult(normalized),
          imageUri,
        };
      } catch {
        if (__DEV__) {
          console.log("[BusinessCardScan] LLM extraction failed, regex fallback used.");
        }
        const parsed = parseBusinessCardText(rawText);
        const normalizedFallback = validateAndNormalizeBusinessCardExtraction(
          fallbackToStructuredInput(parsed),
          rawText,
          ocr.lines,
          candidateHints.addressLines
        );
        return {
          ...toBusinessCardOcrResult(normalizedFallback),
          imageUri,
        };
      }
    },
    []
  );

  const pickImageFromSource = useCallback(async (source: "camera" | "gallery"): Promise<string | null> => {
    if (source === "camera") {
      let status = await ImagePicker.getCameraPermissionsAsync();
      if (!status.granted) {
        status = await ImagePicker.requestCameraPermissionsAsync();
      }
      if (!status.granted) {
        setError("Kamera erişim izni verilmedi.");
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        // Cropping produced invalid JPEG payloads on some devices (tiny ~600B files).
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return null;
      }

      return result.assets[0].uri;
    }

    let status = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!status.granted) {
      status = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    if (!status.granted) {
      setError("Galeri erişim izni verilmedi.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // Keep original file to avoid broken image payloads from editor output.
      allowsEditing: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  }, []);

  const scanBusinessCard = useCallback(
    async (): Promise<BusinessCardOcrResult | null> => {
      setError(null);
      setIsScanning(true);
      try {
        const imageUri = await pickImageFromSource("camera");
        if (!imageUri) return null;
        return await processImage(imageUri);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kartvizit tarama başarısız.");
        return null;
      } finally {
        setIsScanning(false);
      }
    },
    [pickImageFromSource, processImage]
  );

  const pickBusinessCardFromGallery = useCallback(
    async (): Promise<BusinessCardOcrResult | null> => {
      setError(null);
      setIsScanning(true);
      try {
        const imageUri = await pickImageFromSource("gallery");
        if (!imageUri) return null;
        return await processImage(imageUri);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kartvizit seçimi başarısız.");
        return null;
      } finally {
        setIsScanning(false);
      }
    },
    [pickImageFromSource, processImage]
  );

  const retryBusinessCardExtraction = useCallback(
    async (imageUri: string): Promise<BusinessCardOcrResult | null> => {
      setError(null);
      setIsScanning(true);
      try {
        return await processImage(imageUri);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kartvizit tekrar işleme başarısız.");
        return null;
      } finally {
        setIsScanning(false);
      }
    },
    [processImage]
  );

  return { scanBusinessCard, pickBusinessCardFromGallery, retryBusinessCardExtraction, isScanning, error };
}
