/**
 * Utility functions for safe date handling and formatting
 */
import { parseISO, isValid } from 'date-fns';

/**
 * Generic helper function for safe date formatting
 */
const safeFormatDateGeneric = (
  date: Date | string | null | undefined,
  formatter: (date: Date, options?: Intl.DateTimeFormatOptions) => string,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = 'Date not available'
): string => {
  if (!date) return fallback;

  try {
    const dateObj = date instanceof Date ? date : parseISO(date);
    if (!isValid(dateObj)) return fallback;

    return formatter(dateObj, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Safely formats a date using Intl.DateTimeFormat
 * @param date - The date to format (Date object, string, or null/undefined)
 * @param options - DateTimeFormat options
 * @param fallback - Fallback text if date is invalid (default: 'Date not available')
 * @returns Formatted date string or fallback text
 */
export const safeFormatDate = (
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions,
  fallback: string = 'Date not available'
): string => {
  return safeFormatDateGeneric(
    date,
    (d, o) => new Intl.DateTimeFormat(undefined, o).format(d),
    options,
    fallback
  );
};

/**
 * Safely formats a date using toLocaleDateString
 * @param date - The date to format (Date object, string, or null/undefined)
 * @param options - Locale options
 * @param fallback - Fallback text if date is invalid (default: 'Date not available')
 * @returns Formatted date string or fallback text
 */
export const safeFormatLocaleDate = (
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = 'Date not available'
): string => {
  return safeFormatDateGeneric(
    date,
    (d, o) => d.toLocaleDateString(undefined, o),
    options,
    fallback
  );
};

/**
 * Safely formats a date using toLocaleString
 * @param date - The date to format (Date object, string, or null/undefined)
 * @param options - Locale options
 * @param fallback - Fallback text if date is invalid (default: 'Date not available')
 * @returns Formatted date string or fallback text
 */
export const safeFormatLocaleString = (
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = 'Date not available'
): string => {
  return safeFormatDateGeneric(
    date,
    (d, o) => d.toLocaleString(undefined, o),
    options,
    fallback
  );
};

/**
 * Safely converts a date value to a Date object using date-fns parseISO
 * @param date - The date value to convert
 * @returns Date object or null if invalid
 */
export const safeParseDate = (
  date: Date | string | null | undefined
): Date | null => {
  if (!date) return null;

  try {
    const dateObj = date instanceof Date ? date : parseISO(date);
    if (!isValid(dateObj)) return null;

    return dateObj;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Checks if a date is valid using date-fns isValid
 * @param date - The date to check
 * @returns True if the date is valid, false otherwise
 */
export const isValidDate = (
  date: Date | string | null | undefined
): boolean => {
  if (!date) return false;

  try {
    const dateObj = date instanceof Date ? date : parseISO(date);
    return isValid(dateObj);
  } catch (error) {
    return false;
  }
};

/**
 * Returns an array of dates between start and end (inclusive).
 * Each entry is returned as an ISO string (full ISO produced by Date.toISOString()),
 * which is safe to pass back into new Date(...) in consumers.
 *
 * @param start - start date (Date | string)
 * @param end - end date (Date | string)
 * @returns string[] - array of ISO date strings (one per day)
 */
export const getDatesBetween = (
  start: Date | string | null | undefined,
  end: Date | string | null | undefined
): string[] => {
  const startDate = safeParseDate(start);
  const endDate = safeParseDate(end);
  if (!startDate || !endDate) return [];
  // Normalize to start-of-day UTC to avoid DST/time issues when iterating
  const s = new Date(
    Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  );
  const e = new Date(
    Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  );
  if (s.getTime() > e.getTime()) return [];

  const days: string[] = [];
  const cursor = new Date(s);
  while (cursor.getTime() <= e.getTime()) {
    days.push(cursor.toISOString());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
};
