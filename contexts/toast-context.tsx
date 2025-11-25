"use client";

import * as React from "react";
import { Toast, ToastType } from "@/components/ui/toast";
import { ToastContainer } from "@/components/ui/toast";
import { setToastInstance } from "@/lib/toast";

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = React.useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        id,
        type,
        message,
        duration,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const toast = React.useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      addToast(message, type, duration);
    },
    [addToast]
  );

  const success = React.useCallback(
    (message: string, duration?: number) => {
      addToast(message, "success", duration);
    },
    [addToast]
  );

  const error = React.useCallback(
    (message: string, duration?: number) => {
      addToast(message, "error", duration);
    },
    [addToast]
  );

  const warning = React.useCallback(
    (message: string, duration?: number) => {
      addToast(message, "warning", duration);
    },
    [addToast]
  );

  const info = React.useCallback(
    (message: string, duration?: number) => {
      addToast(message, "info", duration);
    },
    [addToast]
  );

  const value = React.useMemo(
    () => ({
      toast,
      success,
      error,
      warning,
      info,
    }),
    [toast, success, error, warning, info]
  );

  // Register toast instance for global access
  React.useEffect(() => {
    setToastInstance({
      toast,
      success,
      error,
      warning,
      info,
    });
  }, [toast, success, error, warning, info]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
