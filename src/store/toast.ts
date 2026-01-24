import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (type: ToastType, message: string, duration = 3000) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      }, duration);
    }
  },
  hideToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearAllToasts: () => set({ toasts: [] }),
}));
