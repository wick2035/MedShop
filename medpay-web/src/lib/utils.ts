import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ClassValue } from 'clsx';

/**
 * Merge class names with Tailwind CSS conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number or numeric string as Chinese Yuan currency (¥1,234.56).
 * Returns '¥0.00' for null/undefined/invalid values.
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === null || amount === undefined || amount === '') {
    return '¥0.00';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return '¥0.00';
  }
  return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a date string as YYYY-MM-DD.
 * Returns '--' for null/undefined values.
 */
export function formatDate(date: string | undefined | null): string {
  if (!date) {
    return '--';
  }
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '--';
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '--';
  }
}

/**
 * Format a date string as YYYY-MM-DD HH:mm.
 * Returns '--' for null/undefined values.
 */
export function formatDateTime(date: string | undefined | null): string {
  if (!date) {
    return '--';
  }
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '--';
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return '--';
  }
}

/**
 * Format a time string as HH:mm.
 * Accepts ISO datetime strings or HH:mm:ss time strings.
 * Returns '--' for null/undefined values.
 */
export function formatTime(time: string | undefined | null): string {
  if (!time) {
    return '--';
  }
  try {
    // If it looks like a bare time string (e.g. "14:30:00" or "14:30")
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
      return time.substring(0, 5);
    }
    // Otherwise parse as a full datetime
    const d = new Date(time);
    if (isNaN(d.getTime())) {
      return '--';
    }
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '--';
  }
}

/**
 * Get initials (first 1-2 characters) from a name for avatar display.
 * For Chinese names, returns the last 1-2 characters (given name).
 * For Latin names, returns up to 2 uppercase initials.
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return '?';
  }
  const trimmed = name.trim();

  // Check if the name contains CJK characters
  const isCJK = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(trimmed);
  if (isCJK) {
    // For Chinese names, return last 1-2 characters (given name portion)
    return trimmed.length >= 2 ? trimmed.slice(-2) : trimmed;
  }

  // For Latin names, split by spaces and take first letter of each word (up to 2)
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

/**
 * Truncate a string to the given length, appending '...' if truncated.
 */
export function truncate(str: string, length: number): string {
  if (!str) {
    return '';
  }
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + '...';
}

/**
 * Promise-based sleep utility.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
