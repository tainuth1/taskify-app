import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to display as "Nov 23, 2025", "Today", "Tomorrow", or "Yesterday"
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string in "MMM DD, YYYY" format, or "Today"/"Tomorrow"/"Yesterday"
 */
export function formatDueDate(date: Date | string | number): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date provided");
  }

  // Normalize dates to midnight for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inputDate = new Date(dateObj);
  inputDate.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Compare dates
  if (inputDate.getTime() === today.getTime()) {
    return "Today";
  }

  if (inputDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  if (inputDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }

  return inputDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
