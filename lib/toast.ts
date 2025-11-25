/**
 * Toast utility function for easy access outside of React components
 * This allows calling toast from anywhere in the codebase
 */

let toastInstance: {
  toast: (
    message: string,
    type?: "success" | "error" | "warning" | "info",
    duration?: number
  ) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
} | null = null;

export function setToastInstance(instance: typeof toastInstance) {
  toastInstance = instance;
}

export const toast = {
  success: (message: string, duration?: number) => {
    toastInstance?.success(message, duration);
  },
  error: (message: string, duration?: number) => {
    toastInstance?.error(message, duration);
  },
  warning: (message: string, duration?: number) => {
    toastInstance?.warning(message, duration);
  },
  info: (message: string, duration?: number) => {
    toastInstance?.info(message, duration);
  },
  // Generic toast function with type parameter
  show: (
    message: string,
    type?: "success" | "error" | "warning" | "info",
    duration?: number
  ) => {
    toastInstance?.toast(message, type, duration);
  },
};
