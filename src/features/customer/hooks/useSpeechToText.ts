import { useCallback, useState } from "react";
import { useToastStore } from "../../../store/toast";
import { useTranslation } from "react-i18next";

interface UseSpeechToTextResult {
  startListening: (onResult: (text: string) => void) => Promise<void>;
  stopListening: () => Promise<void>;
  isListening: boolean;
}

export function useSpeechToText(): UseSpeechToTextResult {
  const [isListening, setIsListening] = useState(false);
  const showToast = useToastStore((s) => s.showToast);
  const { t } = useTranslation();

  const startListening = useCallback(
    async (_onResult: (text: string) => void) => {
      setIsListening(false);
      showToast("info", t("common.voiceSearchSupportInfo"));
    },
    [showToast, t]
  );

  const stopListening = useCallback(async () => {
    setIsListening(false);
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
  };
}
