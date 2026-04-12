import { useCallback } from "react";
import { useUIStore } from "@/stores/uiStore";
import type { ToastType } from "@/stores/uiStore";

export function useToast() {
  // Use selectors to prevent unnecessary re-renders
  const toasts = useUIStore((state) => state.toasts);
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  const toast = toasts[0] || {
    message: null,
    type: "success" as ToastType,
    id: "",
  };

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      addToast(message, type);
    },
    [addToast],
  );

  const clearToast = useCallback(() => {
    if (toasts.length > 0) {
      removeToast(toasts[0].id);
    }
  }, [toasts, removeToast]);

  return {
    showToast,
    toast: { message: toast.message, type: toast.type },
    clearToast,
  };
}


export function showErrorMessages(
  error: unknown,
  fallbackMessage: string = "Terjadi kesalahan",
) {
  const { addToast } = useUIStore.getState();

  // Check if it's an ApiError with errors array
  if (error && typeof error === "object" && "errors" in error) {
    const apiError = error as { errors?: string[]; message?: string };
    const errors = apiError.errors;

    if (errors && errors.length > 0) {
      // Join all errors into a single message
      const allErrors = [
        ...(apiError.message && apiError.message !== "Validasi gagal" ? [apiError.message] : []),
        ...errors,
      ].join("\n");

      addToast(allErrors, "error");
      return;
    }
  }

  // Fallback to single error message
  const message = error instanceof Error ? error.message : fallbackMessage;
  addToast(message, "error");
}
