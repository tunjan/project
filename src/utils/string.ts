/**
 * String utility functions
 */

/**
 * Generates initials from a name string
 * @param name - The name to generate initials from
 * @returns The initials (up to 2 characters)
 */
export const getInitials = (name?: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Deterministic background color generator based on name string
 * @param str - The string to generate a color from
 * @returns HSL color string
 */
export const stringToColor = (str?: string) => {
  if (!str) return '#CBD5E1'; // neutral if no name
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 60% 50%)`;
};
