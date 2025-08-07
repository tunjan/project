import { Challenge } from './types';

export const mockChallenges: Challenge[] = [
    {
        id: 'challenge-1',
        title: 'Q3 Outreach Hours Challenge',
        description: 'The chapter with the most outreach hours logged by the end of September wins bragging rights and a featured spot on the global homepage.',
        metric: 'Outreach Hours',
        goal: 1000,
        endDate: new Date('2025-09-30T23:59:59Z'),
        participants: [
            { id: 'chapter-london', name: 'London', progress: 750 },
            { id: 'chapter-ny', name: 'New York', progress: 680 },
            { id: 'chapter-berlin', name: 'Berlin', progress: 820 },
            { id: 'chapter-sydney', name: 'Sydney', progress: 590 },
            { id: 'chapter-tokyo', name: 'Tokyo', progress: 710 },
        ].sort((a, b) => b.progress - a.progress),
    },
    {
        id: 'challenge-2',
        title: 'Summer Vegan Conversion Drive',
        description: 'The chapter that records the most vegan conversions between June and August gets a bonus grant for their next big event.',
        metric: 'Vegan Conversions',
        goal: 100,
        endDate: new Date('2025-08-31T23:59:59Z'),
        participants: [
            { id: 'chapter-paris', name: 'Paris', progress: 85 },
            { id: 'chapter-la', name: 'Los Angeles', progress: 92 },
            { id: 'chapter-toronto', name: 'Toronto', progress: 78 },
        ].sort((a, b) => b.progress - a.progress),
    },
    {
        id: 'challenge-3',
        title: 'Q4 Vegan Outreach Sign-ups',
        description: 'Chapter with the most new sign-ups to the Vegan Outreach program by year-end wins a special grant.',
        metric: 'New Sign-ups',
        goal: 500,
        endDate: new Date('2025-12-31T23:59:59Z'),
        participants: [
            { id: 'chapter-berlin', name: 'Berlin', progress: 380 },
            { id: 'chapter-sydney', name: 'Sydney', progress: 410 },
            { id: 'chapter-london', name: 'London', progress: 350 },
        ].sort((a, b) => b.progress - a.progress),
    },
    {
        id: 'challenge-4',
        title: 'Spring Cube Attendance Boost',
        description: 'The chapter with the highest percentage increase in Cube attendance during spring months receives new outreach equipment.',
        metric: 'Attendance Increase (%)',
        goal: 20,
        endDate: new Date('2026-05-31T23:59:59Z'),
        participants: [
            { id: 'chapter-ny', name: 'New York', progress: 18 },
            { id: 'chapter-paris', name: 'Paris', progress: 15 },
            { id: 'chapter-tokyo', name: 'Tokyo', progress: 22 },
        ].sort((a, b) => b.progress - a.progress),
    },
];
