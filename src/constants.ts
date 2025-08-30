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
    name: 'First Blood',
    description: 'Completed your first Cube of Truth. The journey begins.',
    icon: 'StarIcon',
  },
  {
    name: 'Nomad',
    description:
      'Attended events across 5+ cities. Your reach extends beyond borders.',
    icon: 'GlobeAltIcon',
  },
  {
    name: 'Voice of Truth',
    description: 'Logged 100+ conversations. Your words carry weight.',
    icon: 'SparklesIcon',
  },
  {
    name: 'Centurion',
    description:
      'Contributed 100+ hours of outreach. Time well spent in service.',
    icon: 'TrophyIcon',
  },
  {
    name: 'Unstoppable',
    description: 'Attended 5 cubes in a single month. Relentless dedication.',
    icon: 'FireIcon',
  },
  {
    name: 'Veteran',
    description:
      'Attended 25+ cubes total. Experience earned through persistence.',
    icon: 'UsersIcon',
  },
  {
    name: 'Chapter Anchor',
    description:
      'Recognized for exceptional contribution to your chapter. You are the foundation.',
    icon: 'ShieldCheckIcon',
  },
  {
    name: 'Guide',
    description:
      'Provided outstanding guidance to new activists. Knowledge shared is power multiplied.',
    icon: 'AcademicCapIcon',
  },
  {
    name: 'Steel Resolve',
    description:
      'Maintained consistent attendance through challenging circumstances. Resilience defines you.',
    icon: 'ShieldCheckIcon',
  },
  {
    name: 'Truth Seeker',
    description:
      'Demonstrated exceptional critical thinking and research skills in outreach.',
    icon: 'AcademicCapIcon',
  },
  {
    name: 'Bridge Builder',
    description:
      'Successfully connected with diverse audiences across cultural and social barriers.',
    icon: 'UsersIcon',
  },
  {
    name: 'Tactical Mind',
    description:
      'Showed strategic thinking in outreach planning and execution.',
    icon: 'SparklesIcon',
  },
];
