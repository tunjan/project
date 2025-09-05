// Analytics utilities
export {
  type ChapterOutreachStats,
  type ChapterStats,
  getActivistConversationsDistribution,
  getActivistHoursDistribution,
  getActivistRetention,
  getAverageActivistsPerEvent,
  getChapterOutreachStats,
  getChapterStats,
  getCityAttendanceForUser,
  getConversationTrendsByMonth,
  getEventTrendsByMonth,
  getEventTurnoutDistribution,
  getGlobalStats,
  getMemberGrowth,
  getTopActivistsByHours,
  getTotalMembersByMonth,
  getUserConversationsByMonth,
  getUserHoursByMonth,
  type GlobalStats,
  type MonthlyTrend,
} from './analytics';

// Centralized metrics calculation
export {
  calculateAllMetrics,
  type MetricsData,
  type UserStats as MetricsUserStats,
} from './metrics';

// Auth utilities
export { getPostableScopes } from './auth';

// Class name utility
export { cn } from './cn';

// Clipboard utilities
export { copyToClipboard } from './copyToClipboard';

// Date utilities
export {
  formatDateSafe,
  getDatesBetween,
  isValidDate,
  safeParseDate,
} from './date';

// File upload utilities
export { readFileAsDataURL, validateImageFile } from './fileUpload';

// Leaderboard utilities
export {
  calculateLeaderboards,
  calculateRanks,
  type ChapterLeaderboardEntry,
  type LeaderboardData,
  type Timeframe,
  type UserLeaderboardEntry,
} from './leaderboard';

// Notification utilities
export { getNotificationIcon } from './notificationUtils';

// Rewards utilities
export { calculateDiscountTier, type TierProgress } from './rewards';

// Scorecard utilities
export { calculateChapterScorecard, type ScorecardData } from './scorecard';

// String utilities
export { getInitials, stringToColor } from './string';

// User utilities
export {
  createUserAttendanceMap,
  generateRandomAvatarUrl,
  getAvatarUrl,
  getConfirmedUsers,
  getUserRoleDisplay,
  INACTIVITY_PERIOD_MONTHS,
  isUserInactive,
} from './user';
