import { BadgeTemplate } from './types';
import {
  MOCK_USERS,
  MOCK_CUBE_EVENTS,
  MOCK_CHAPTERS,
  MOCK_ANNOUNCEMENTS,
  MOCK_RESOURCES,
  MOCK_ACCOMMODATION_REQUESTS,
  MOCK_OUTREACH_LOGS,
  MOCK_EVENT_COMMENTS,
  MOCK_CHALLENGES,
  MOCK_NOTIFICATIONS,
  MOCK_BADGE_AWARDS,
} from './mockData';

/**
 * ============================================================================
 *                              BADGE TEMPLATES
 * ============================================================================
 * This is the master list of all available badges that can be awarded.
 * The `icon` property is a string key that maps to a component in `@/icons`.
 */
export const BADGE_TEMPLATES: BadgeTemplate[] = [
  {
    name: 'First Cube',
    description: 'Attended your first Cube of Truth.',
    icon: 'StarIcon',
  },
  {
    name: 'Road Warrior',
    description: 'Attended events in 5+ different cities.',
    icon: 'GlobeAltIcon',
  },
  {
    name: 'Top Orator',
    description: 'Logged over 100 conversations.',
    icon: 'SparklesIcon',
  },
  {
    name: 'Veteran Activist',
    description: 'Contributed over 100 hours of outreach.',
    icon: 'TrophyIcon',
  },
  {
    name: 'On Fire',
    description: 'Attended 5 cubes in a single month.',
    icon: 'FireIcon',
  },
  {
    name: 'Community Pillar',
    description: 'Attended over 25 cubes total.',
    icon: 'UsersIcon',
  },
  {
    name: 'Local Legend',
    description: 'Recognized for exceptional contribution to a chapter.',
    icon: 'ShieldCheckIcon',
  },
  {
    name: 'Mentor',
    description: 'Provided outstanding guidance to new activists.',
    icon: 'AcademicCapIcon',
  },
];

/**
 * ============================================================================
 *                           MOCK DATA RE-EXPORTS
 * ============================================================================
 * This section re-exports the auto-generated data from `mockData.ts` under
 * simpler, more consistent names for use throughout the application,
 * particularly in the Zustand store (`appStore.ts`).
 */
export const USERS = MOCK_USERS;
export const CUBE_EVENTS = MOCK_CUBE_EVENTS;
export const CHAPTERS = MOCK_CHAPTERS;
export const ANNOUNCEMENTS = MOCK_ANNOUNCEMENTS;
export const RESOURCES = MOCK_RESOURCES;
export const ACCOMMODATION_REQUESTS = MOCK_ACCOMMODATION_REQUESTS;
export const OUTREACH_LOGS = MOCK_OUTREACH_LOGS;
export const EVENT_COMMENTS = MOCK_EVENT_COMMENTS;
export const CHALLENGES_DATA = MOCK_CHALLENGES;
export const NOTIFICATIONS = MOCK_NOTIFICATIONS;
export const BADGE_AWARDS = MOCK_BADGE_AWARDS;