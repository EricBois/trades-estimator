import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";

// Tailwind class merging utility
export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

// Date utilities using Luxon
// All dates are stored/compared in UTC, displayed in local time

/**
 * Parse a date as UTC, returns DateTime in UTC
 */
function parseUtc(date: string | Date): DateTime {
  if (typeof date === "string") {
    return DateTime.fromISO(date, { zone: "utc" });
  }
  return DateTime.fromJSDate(date, { zone: "utc" });
}

/**
 * Parse a date as UTC, convert to local for display
 */
function parseUtcToLocal(date: string | Date): DateTime {
  return parseUtc(date).toLocal();
}

/**
 * Get current time in UTC
 */
function nowUtc(): DateTime {
  return DateTime.utc();
}

/**
 * Format date for display (e.g., "Dec 28, 2025")
 * Displays in user's local timezone
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return "";
  return parseUtcToLocal(date).toLocaleString(DateTime.DATE_MED);
}

/**
 * Format date with time (e.g., "Dec 28, 2025, 2:30 PM")
 * Displays in user's local timezone
 */
export function formatDateTime(date: string | Date | null): string {
  if (!date) return "";
  return parseUtcToLocal(date).toLocaleString(DateTime.DATETIME_MED);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelative(date: string | Date | null): string {
  if (!date) return "";
  return parseUtc(date).toRelative() ?? "";
}

/**
 * Check if a date has expired (UTC comparison)
 */
export function isExpired(date: string | Date | null): boolean {
  if (!date) return false;
  return parseUtc(date) < nowUtc();
}

/**
 * Get days until expiration (negative if expired)
 * Uses UTC for accurate day calculation
 */
export function daysUntilExpiration(date: string | Date | null): number {
  if (!date) return 0;
  const diff = parseUtc(date).diff(nowUtc(), "days");
  return Math.floor(diff.days);
}

/**
 * Smart date formatting based on age:
 * - Today: "Today at 2:30 PM"
 * - Yesterday: "Yesterday at 2:30 PM"
 * - This week: "Monday at 2:30 PM"
 * - This year: "Dec 28 at 2:30 PM"
 * - Older: "Dec 28, 2024"
 * Displays in user's local timezone
 */
export function formatEstimateDate(date: string | Date | null): string {
  if (!date) return "";
  const dt = parseUtcToLocal(date);
  const now = DateTime.local();

  const diffDays = now.startOf("day").diff(dt.startOf("day"), "days").days;

  if (diffDays < 1) {
    return `Today at ${dt.toLocaleString(DateTime.TIME_SIMPLE)}`;
  }

  if (diffDays < 2) {
    return `Yesterday at ${dt.toLocaleString(DateTime.TIME_SIMPLE)}`;
  }

  if (diffDays < 7) {
    return `${dt.weekdayLong} at ${dt.toLocaleString(DateTime.TIME_SIMPLE)}`;
  }

  if (dt.year === now.year) {
    return `${dt.toFormat("LLL d")} at ${dt.toLocaleString(
      DateTime.TIME_SIMPLE
    )}`;
  }

  return dt.toLocaleString(DateTime.DATE_MED);
}

/**
 * Get current UTC timestamp as ISO string (for database storage)
 */
export function utcNow(): string {
  return DateTime.utc().toISO();
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format estimate range (e.g., "$1,500 - $2,000")
 */
export function formatEstimateRange(low: number, high: number): string {
  return `${formatCurrency(low)} - ${formatCurrency(high)}`;
}

/**
 * Convert snake_case keys to camelCase
 */
export function toCamelCase<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );
    result[camelKey] = value;
  }
  return result as T;
}

/**
 * Convert camelCase keys to snake_case
 */
export function toSnakeCase(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    result[snakeKey] = value;
  }
  return result;
}
