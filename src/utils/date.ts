import { isValid, parseISO } from 'date-fns';

export const formatDateSafe = (
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

export const isValidDate = (
  date: Date | string | null | undefined
): boolean => {
  if (!date) return false;

  try {
    const dateObj = date instanceof Date ? date : parseISO(date);
    return isValid(dateObj);
  } catch {
    return false;
  }
};

export const getDatesBetween = (
  start: Date | string | null | undefined,
  end: Date | string | null | undefined
): string[] => {
  const startDate = safeParseDate(start);
  const endDate = safeParseDate(end);
  if (!startDate || !endDate) return [];
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
