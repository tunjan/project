/**
 * Utility functions for safe date handling and formatting
 */

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
  if (!date) return fallback;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return fallback;
    
    return new Intl.DateTimeFormat(undefined, options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
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
  if (!date) return fallback;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return fallback;
    
    return dateObj.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
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
  if (!date) return fallback;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return fallback;
    
    return dateObj.toLocaleString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Safely converts a date value to a Date object
 * @param date - The date value to convert
 * @returns Date object or null if invalid
 */
export const safeParseDate = (date: Date | string | null | undefined): Date | null => {
  if (!date) return null;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    
    return dateObj;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Checks if a date is valid
 * @param date - The date to check
 * @returns True if the date is valid, false otherwise
 */
export const isValidDate = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};
