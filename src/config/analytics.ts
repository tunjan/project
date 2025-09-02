/**
 * Analytics configuration constants
 * Centralized location for all analytics-related configuration values
 */

// Weights for calculating chapter health scores
export const WEIGHTS = {
  EVENT_FREQUENCY: 0.5,
  MEMBER_COUNT: 0.2,
  RETENTION_RATE: 0.3,
} as const;

// Target values for normalization in analytics calculations
export const TARGETS = {
  EVENTS_PER_MONTH: 4, // Target 1 event per week
  MEMBER_COUNT: 50,
  RETENTION_RATE: 0.75, // Target 75% retention
} as const;
