import { BadgeTemplate } from './types';

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
