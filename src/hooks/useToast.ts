import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToastStore, type ToastType } from "../store/toast";

interface UseToastReturn {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

export function useToast(): UseToastReturn {
  const { t } = useTranslation();
  const { showToast, hideToast, clearAllToasts } = useToastStore();

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast("success", message, duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast("error", message || t("common.unknownError"), duration);
    },
    [showToast, t]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast("warning", message, duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast("info", message, duration);
    },
    [showToast]
  );

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
    clearAllToasts,
  };
}
