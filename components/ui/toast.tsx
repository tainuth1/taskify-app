"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig: Record<
  ToastType,
  { emoji: React.ReactNode; bgColor: string; textColor: string }
> = {
  success: {
    emoji: <CheckCircle className="size-5" />,
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
  },
  error: {
    emoji: <X className="size-5" />,
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-800",
  },
  warning: {
    emoji: <AlertTriangle className="size-5" />,
    bgColor: "bg-amber-50 border-amber-200",
    textColor: "text-amber-800",
  },
  info: {
    emoji: <Info className="size-5" />,
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-800",
  },
};

export function ToastItem({ toast, onClose }: ToastProps) {
  const config = toastConfig[toast.type];
  const duration = toast.duration ?? 4000;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md border shadow-lg min-w-[300px] max-w-[500px]",
        config.bgColor
      )}
    >
      <span className="text-xl shrink-0">{config.emoji}</span>
      <p className={cn("flex-1 text-sm font-medium", config.textColor)}>
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className={cn(
          "shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors",
          config.textColor
        )}
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex flex-col gap-2 items-center pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={onClose} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
