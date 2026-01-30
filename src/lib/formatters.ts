/**
 * Formatting utilities for The Roof HRM
 * - Currency: Vietnamese đồng (đ) displayed as "848M đ"
 * - Dates: DD/MM/YYYY format
 * - Timezone: Vietnam (Asia/Ho_Chi_Minh, UTC+7)
 */

// =============================================
// Currency Formatting
// =============================================

/**
 * Format currency in Vietnamese đồng with abbreviated notation
 * @param value - Amount in VND (full number, e.g., 848000000)
 * @param options - Formatting options
 * @returns Formatted string like "848M đ" or "1.2B đ"
 */
export function formatCurrency(
  value: number | null | undefined,
  options: {
    abbreviated?: boolean;
    showSign?: boolean;
    decimals?: number;
  } = {}
): string {
  if (value === null || value === undefined) return '0 đ';
  
  const { abbreviated = true, showSign = false, decimals = 1 } = options;
  
  const sign = value >= 0 ? (showSign ? '+' : '') : '-';
  const absValue = Math.abs(value);
  
  if (!abbreviated) {
    // Full number with thousands separator
    return `${sign}${absValue.toLocaleString('vi-VN')} đ`;
  }
  
  // Abbreviated format
  if (absValue >= 1_000_000_000) {
    // Billions → B
    const billions = absValue / 1_000_000_000;
    return `${sign}${billions.toFixed(decimals)}B đ`;
  } else if (absValue >= 1_000_000) {
    // Millions → M
    const millions = absValue / 1_000_000;
    return `${sign}${millions.toFixed(decimals)}M đ`;
  } else if (absValue >= 1_000) {
    // Thousands → K
    const thousands = absValue / 1_000;
    return `${sign}${thousands.toFixed(decimals)}K đ`;
  } else {
    return `${sign}${absValue} đ`;
  }
}

/**
 * Format currency for display in tables (shorter format)
 * @param value - Amount in VND
 * @returns Formatted string like "848M"
 */
export function formatCurrencyShort(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(1)}B`;
  } else if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(0)}M`;
  } else if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(0)}K`;
  }
  return `${sign}${absValue}`;
}

/**
 * Parse currency string back to number
 * @param str - Currency string like "848M đ" or "848,000,000"
 * @returns Number value in VND
 */
export function parseCurrency(str: string): number {
  if (!str) return 0;
  
  // Remove currency symbol and whitespace
  const cleaned = str.replace(/[đ\s,]/g, '').toUpperCase();
  
  // Handle abbreviated formats
  if (cleaned.endsWith('B')) {
    return parseFloat(cleaned.slice(0, -1)) * 1_000_000_000;
  } else if (cleaned.endsWith('M')) {
    return parseFloat(cleaned.slice(0, -1)) * 1_000_000;
  } else if (cleaned.endsWith('K')) {
    return parseFloat(cleaned.slice(0, -1)) * 1_000;
  }
  
  return parseFloat(cleaned) || 0;
}

// =============================================
// Date Formatting
// =============================================

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Format date in Vietnamese format (DD/MM/YYYY)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Format in Vietnam timezone
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: VIETNAM_TIMEZONE,
  });
}

/**
 * Format date as short format (DD/MM)
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    timeZone: VIETNAM_TIMEZONE,
  });
}

/**
 * Format time in 24-hour format (HH:mm)
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: VIETNAM_TIMEZONE,
  });
}

/**
 * Format datetime (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: VIETNAM_TIMEZONE,
  });
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  
  if (Math.abs(diffSecs) < 60) {
    return rtf.format(diffSecs, 'second');
  } else if (Math.abs(diffMins) < 60) {
    return rtf.format(diffMins, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, 'day');
  } else {
    return formatDate(d);
  }
}

/**
 * Get day of week name
 */
export function getDayName(date: string | Date, locale: 'en' | 'vi' = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    timeZone: VIETNAM_TIMEZONE,
  });
}

/**
 * Get short day name (Mon, Tue, etc.)
 */
export function getDayNameShort(date: string | Date, locale: 'en' | 'vi' = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short',
    timeZone: VIETNAM_TIMEZONE,
  });
}

/**
 * Get month name
 */
export function getMonthName(month: number, locale: 'en' | 'vi' = 'en'): string {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'long',
  });
}

/**
 * Parse DD/MM/YYYY string to Date
 */
export function parseVietnameseDate(str: string): Date | null {
  if (!str) return null;
  
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month - 1, day);
}

/**
 * Get today's date in Vietnam timezone
 */
export function getTodayVietnam(): Date {
  const now = new Date();
  const vietnamDate = new Date(now.toLocaleString('en-US', { timeZone: VIETNAM_TIMEZONE }));
  return vietnamDate;
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = getTodayVietnam();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Get start and end of current month
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const today = getTodayVietnam();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start, end };
}

/**
 * Get number of days remaining in current month
 */
export function getDaysRemainingInMonth(): number {
  const today = getTodayVietnam();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return lastDay.getDate() - today.getDate();
}

// =============================================
// Percentage Formatting
// =============================================

/**
 * Format percentage with sign
 * @param value - Decimal value (0.15 = 15%)
 * @param options - Formatting options
 */
export function formatPercent(
  value: number | null | undefined,
  options: {
    decimals?: number;
    showSign?: boolean;
    multiply?: boolean; // If true, multiply by 100
  } = {}
): string {
  if (value === null || value === undefined) return '0%';
  
  const { decimals = 1, showSign = true, multiply = false } = options;
  
  const percent = multiply ? value * 100 : value;
  const sign = percent > 0 && showSign ? '+' : '';
  
  return `${sign}${percent.toFixed(decimals)}%`;
}

/**
 * Format YoY change percentage
 */
export function formatYoYChange(current: number, previous: number): string {
  if (!previous || previous === 0) return 'N/A';
  
  const change = ((current - previous) / previous) * 100;
  return formatPercent(change, { showSign: true, decimals: 1 });
}

// =============================================
// Number Formatting
// =============================================

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString('vi-VN');
}

/**
 * Format hours (e.g., "8.5h" or "8h 30m")
 */
export function formatHours(hours: number, detailed = false): string {
  if (detailed) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${hours.toFixed(1)}h`;
}

// =============================================
// Locale-aware formatting
// =============================================

/**
 * Get localized string based on current locale
 */
export function getLocalizedText(
  en: string,
  vi: string | undefined | null,
  locale: 'en' | 'vi' = 'en'
): string {
  if (locale === 'vi' && vi) return vi;
  return en;
}
