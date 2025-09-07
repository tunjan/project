import { faker } from '@faker-js/faker';
import fs from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

import { BADGE_TEMPLATES } from '../src/constants';
import {
  AccommodationRequest,
  Announcement,
  AnnouncementScope,
  BadgeAward,
  Challenge,
  Chapter,
  CubeEvent,
  EventComment,
  EventStatus,
  InventoryItem,
  Notification,
  NotificationType,
  OnboardingStatus,
  OutreachLog,
  OutreachOutcome,
  ParticipantStatus,
  Resource,
  ResourceType,
  Role,
  SkillLevel,
  TourDuty,
  User,
} from '../src/types';
import { generateAvatarUrl } from '../src/utils/user';

console.log('--- Starting Mock Data Generation ---');

const env = process.env.NODE_ENV || 'development';

const ENV_CONFIG = {
  development: {
    NUM_CHAPTERS: 5,
    NUM_USERS: 200,
    EVENTS_PER_CHAPTER_MIN: 2,
    EVENTS_PER_CHAPTER_MAX: 5,
    ANNOUNCEMENTS: 5,
    RESOURCES: 10,
    CHALLENGES: 1,
    REALISTIC_DATES: false,
  },
  staging: {
    NUM_CHAPTERS: 15,
    NUM_USERS: 200,
    EVENTS_PER_CHAPTER_MIN: 3,
    EVENTS_PER_CHAPTER_MAX: 10,
    ANNOUNCEMENTS: 20,
    RESOURCES: 15,
    CHALLENGES: 2,
    REALISTIC_DATES: true,
  },
  production: {
    NUM_CHAPTERS: 25,
    NUM_USERS: 600,
    EVENTS_PER_CHAPTER_MIN: 5,
    EVENTS_PER_CHAPTER_MAX: 10,
    ANNOUNCEMENTS: 60,
    RESOURCES: 20,
    CHALLENGES: 2,
    REALISTIC_DATES: true,
  },
};

const config =
  ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;
console.log(`🌱 Using '${env}' environment config.`);

faker.seed(123);
const CHAPTER_SEED = 1;
const EVENT_SEED = 3;

const writeDataToFile = (data: Record<string, unknown[]>) => {
  let fileContent = `import { User, Chapter, CubeEvent, OutreachLog, Announcement, Resource, AccommodationRequest, EventComment, Challenge, Notification, BadgeAward, InventoryItem, Role, OnboardingStatus, EventStatus, ParticipantStatus, OutreachOutcome, AnnouncementScope, ResourceType, SkillLevel, NotificationType } from '../types';
`;

  const typeMap: Record<string, string> = {
    users: 'User',
    chapters: 'Chapter',
    events: 'CubeEvent',
    outreachLogs: 'OutreachLog',
    announcements: 'Announcement',
    resources: 'Resource',
    accommodationRequests: 'AccommodationRequest',
    eventComments: 'EventComment',
    challenges: 'Challenge',
    notifications: 'Notification',
    badgeAwards: 'BadgeAward',
    inventory: 'InventoryItem',
  };

  for (const [key, value] of Object.entries(data)) {
    const type = typeMap[key] || 'any';
    let valueString = JSON.stringify(value, null, 2);

    valueString = valueString.replace(
      /"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)"/g,
      'new Date("$1")'
    );

    const enumReplacements = [
      { from: '"role": "Godmode"', to: '"role": Role.GODMODE' },
      { from: '"role": "Global Admin"', to: '"role": Role.GLOBAL_ADMIN' },
      {
        from: '"role": "Regional Organiser"',
        to: '"role": Role.REGIONAL_ORGANISER',
      },
      {
        from: '"role": "Chapter Organiser"',
        to: '"role": Role.CHAPTER_ORGANISER',
      },
      { from: '"role": "Activist"', to: '"role": Role.ACTIVIST' },
      { from: '"role": "Applicant"', to: '"role": Role.APPLICANT' },

      {
        from: '"onboardingStatus": "Confirmed"',
        to: '"onboardingStatus": OnboardingStatus.CONFIRMED',
      },
      {
        from: '"onboardingStatus": "Pending Application Review"',
        to: '"onboardingStatus": OnboardingStatus.PENDING_APPLICATION_REVIEW',
      },
      {
        from: '"onboardingStatus": "Pending Onboarding Call"',
        to: '"onboardingStatus": OnboardingStatus.PENDING_ONBOARDING_CALL',
      },
      {
        from: '"onboardingStatus": "Awaiting First Cube"',
        to: '"onboardingStatus": OnboardingStatus.AWAITING_FIRST_CUBE',
      },
      {
        from: '"onboardingStatus": "Awaiting Masterclass"',
        to: '"onboardingStatus": OnboardingStatus.AWAITING_MASTERCLASS',
      },
      {
        from: '"onboardingStatus": "Awaiting Revision Call"',
        to: '"onboardingStatus": OnboardingStatus.AWAITING_REVISION_CALL',
      },
      {
        from: '"onboardingStatus": "Completed"',
        to: '"onboardingStatus": OnboardingStatus.COMPLETED',
      },
      {
        from: '"onboardingStatus": "Denied"',
        to: '"onboardingStatus": OnboardingStatus.DENIED',
      },
      {
        from: '"onboardingStatus": "Inactive"',
        to: '"onboardingStatus": OnboardingStatus.INACTIVE',
      },

      { from: '"status": "Upcoming"', to: '"status": EventStatus.UPCOMING' },
      { from: '"status": "Finished"', to: '"status": EventStatus.FINISHED' },
      { from: '"status": "Cancelled"', to: '"status": EventStatus.CANCELLED' },

      {
        from: '"status": "Attending"',
        to: '"status": ParticipantStatus.ATTENDING',
      },
      {
        from: '"status": "Pending"',
        to: '"status": ParticipantStatus.PENDING',
      },

      {
        from: '"outcome": "Became vegan and activist"',
        to: '"outcome": OutreachOutcome.BECAME_VEGAN_ACTIVIST',
      },
      {
        from: '"outcome": "Became vegan"',
        to: '"outcome": OutreachOutcome.BECAME_VEGAN',
      },
      {
        from: '"outcome": "Already vegan, now activist"',
        to: '"outcome": OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST',
      },
      {
        from: '"outcome": "Mostly sure"',
        to: '"outcome": OutreachOutcome.MOSTLY_SURE',
      },
      {
        from: '"outcome": "Not sure"',
        to: '"outcome": OutreachOutcome.NOT_SURE',
      },
      {
        from: '"outcome": "No change / Dismissive"',
        to: '"outcome": OutreachOutcome.NO_CHANGE',
      },

      { from: '"scope": "Chapter"', to: '"scope": AnnouncementScope.CHAPTER' },
      {
        from: '"scope": "Regional"',
        to: '"scope": AnnouncementScope.REGIONAL',
      },
      { from: '"scope": "Global"', to: '"scope": AnnouncementScope.GLOBAL' },

      { from: '"type": "Document"', to: '"type": ResourceType.DOCUMENT' },
      { from: '"type": "Video"', to: '"type": ResourceType.VIDEO' },
      { from: '"type": "Guide"', to: '"type": ResourceType.GUIDE' },
      { from: '"type": "Link"', to: '"type": ResourceType.LINK' },

      {
        from: '"skillLevel": "Beginner"',
        to: '"skillLevel": SkillLevel.BEGINNER',
      },
      {
        from: '"skillLevel": "Intermediate"',
        to: '"skillLevel": SkillLevel.INTERMEDIATE',
      },
      {
        from: '"skillLevel": "Advanced"',
        to: '"skillLevel": SkillLevel.ADVANCED',
      },

      {
        from: '"type": "New Applicant"',
        to: '"type": NotificationType.NEW_APPLICANT',
      },
      {
        from: '"type": "Accommodation Request"',
        to: '"type": NotificationType.ACCOMMODATION_REQUEST',
      },
      {
        from: '"type": "Request Accepted"',
        to: '"type": NotificationType.REQUEST_ACCEPTED',
      },
      {
        from: '"type": "Request Denied"',
        to: '"type": NotificationType.REQUEST_DENIED',
      },
      {
        from: '"type": "Recognition Awarded"',
        to: '"type": NotificationType.BADGE_AWARDED',
      },
    ];

    enumReplacements.forEach(({ from, to }) => {
      valueString = valueString.replace(
        new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        to
      );
    });

    fileContent += `\n\nexport const ${key}: ${type}[] = ${valueString};`;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = path.join(__dirname, '../src/data/mockData.ts');

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}`);
  }

  fs.writeFileSync(outputPath, fileContent);
  console.log(`✅ Mock data written to ${outputPath}`);
};

const CITIES_COUNTRIES = [
  { city: 'London', country: 'United Kingdom', lat: 51.5072, lng: -0.1276 },
  { city: 'Manchester', country: 'United Kingdom', lat: 53.4808, lng: -2.2426 },
  { city: 'Bristol', country: 'United Kingdom', lat: 51.4545, lng: -2.5879 },
  { city: 'Birmingham', country: 'United Kingdom', lat: 52.4862, lng: -1.8904 },
  { city: 'Edinburgh', country: 'United Kingdom', lat: 55.9533, lng: -3.1883 },
  { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
  { city: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.582 },
  { city: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937 },
  { city: 'Cologne', country: 'Germany', lat: 50.9375, lng: 6.9603 },
  { city: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821 },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'Lyon', country: 'France', lat: 45.764, lng: 4.8357 },
  { city: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698 },
  { city: 'Toulouse', country: 'France', lat: 43.6047, lng: 1.4442 },
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298 },
  { city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
  { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { city: 'Seattle', country: 'USA', lat: 47.6062, lng: -122.3321 },
  { city: 'Portland', country: 'USA', lat: 45.5152, lng: -122.6784 },
  { city: 'Austin', country: 'USA', lat: 30.2672, lng: -97.7431 },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207 },
  { city: 'Montreal', country: 'Canada', lat: 45.5017, lng: -73.5673 },
  { city: 'Calgary', country: 'Canada', lat: 51.0447, lng: -114.0719 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { city: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631 },
  { city: 'Brisbane', country: 'Australia', lat: -27.4698, lng: 153.0251 },
  { city: 'Perth', country: 'Australia', lat: -31.9505, lng: 115.8605 },
  { city: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633 },
  { city: 'Wellington', country: 'New Zealand', lat: -41.2865, lng: 174.7762 },
  { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686 },
  { city: 'Gothenburg', country: 'Sweden', lat: 57.7089, lng: 11.9746 },
  { city: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522 },
  { city: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683 },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { city: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517 },
  { city: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738 },
  { city: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { city: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603 },
  { city: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818 },
  { city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { city: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.19 },
];

const HOLIDAYS = [
  '2024-01-01',
  '2024-12-25',
  '2024-07-04',
  '2024-11-28',
  '2024-12-24',
  '2023-01-01',
  '2023-12-25',
  '2023-07-04',
  '2023-11-28',
  '2023-12-24',
];

const generateRealisticEventDate = () => {
  let date: Date;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    // More realistic distribution: more recent/upcoming events, fewer very old ones
    const timeRanges = [
      { from: -365, to: -90, weight: 10 }, // Older events (less common)
      { from: -90, to: -30, weight: 25 }, // Recent past events
      { from: -30, to: 0, weight: 35 }, // Very recent events
      { from: 0, to: 30, weight: 20 }, // Near future events
      { from: 30, to: 90, weight: 10 }, // Future events
    ];

    const selectedRange = faker.helpers.weightedArrayElement(
      timeRanges.map((r) => ({
        weight: r.weight,
        value: r,
      }))
    );

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() + selectedRange.from);

    const toDate = new Date();
    toDate.setDate(toDate.getDate() + selectedRange.to);

    date = faker.date.between({ from: fromDate, to: toDate });

    if (config.REALISTIC_DATES) {
      const day = date.getDay();
      // Most events happen on weekends, some on Friday evenings
      if (day !== 0 && day !== 6 && day !== 5) {
        // Move to nearest weekend
        const daysToSaturday = 6 - day;
        const daysToSunday = 7 - day;
        const adjustment =
          daysToSaturday <= daysToSunday ? daysToSaturday : daysToSunday;
        date.setDate(date.getDate() + adjustment);
      }
    }
    attempts++;
  } while (
    config.REALISTIC_DATES &&
    HOLIDAYS.includes(date.toISOString().split('T')[0]) &&
    attempts < maxAttempts
  );

  // More realistic event times - most happen in the afternoon
  const eventTimes = [
    { hour: 11, weight: 5 }, // Late morning
    { hour: 12, weight: 15 }, // Lunch time
    { hour: 13, weight: 25 }, // Early afternoon (most popular)
    { hour: 14, weight: 25 }, // Mid afternoon (most popular)
    { hour: 15, weight: 20 }, // Late afternoon
    { hour: 16, weight: 10 }, // Evening
  ];

  const selectedTime = faker.helpers.weightedArrayElement(
    eventTimes.map((t) => ({
      weight: t.weight,
      value: t.hour,
    }))
  );

  date.setHours(selectedTime, 0, 0, 0);
  return date;
};

const generateChapters = (count: number): Chapter[] => {
  faker.seed(CHAPTER_SEED);
  const selectedCities = faker.helpers.arrayElements(
    CITIES_COUNTRIES,
    Math.min(count, CITIES_COUNTRIES.length)
  );
  return selectedCities.map((c) => ({
    name: c.city,
    country: c.country,
    lat: c.lat,
    lng: c.lng,
    instagram: `@av_${c.city.toLowerCase().replace(/ /g, '')}`,
  }));
};

const generateUsers = (count: number, chapters: Chapter[]): User[] => {
  const users: User[] = [];
  const countries = [...new Set(chapters.map((c) => c.country))];

  const createKeyUser = (role: Role, overrides: Partial<User> = {}): User => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = overrides.name || `${firstName} ${lastName}`;
    const id = nanoid();

    // More realistic join dates for key users (they've been around longer)
    const joinDate =
      role === Role.GODMODE || role === Role.GLOBAL_ADMIN
        ? faker.date.past({ years: faker.number.int({ min: 2, max: 5 }) })
        : role === Role.REGIONAL_ORGANISER
          ? faker.date.past({ years: faker.number.int({ min: 1, max: 3 }) })
          : faker.date.past({ years: faker.number.int({ min: 0.5, max: 2 }) });

    // Key users are more active
    const lastLogin = faker.date.recent({
      days: faker.number.int({ min: 1, max: 7 }),
    });

    return {
      id,
      name,
      email: faker.internet.email({ firstName, lastName }),
      role,
      chapters: [],
      onboardingStatus: OnboardingStatus.CONFIRMED,
      activityLevel: faker.helpers.weightedArrayElement([
        { weight: 70, value: 'high' }, // Key users are mostly high activity
        { weight: 25, value: 'medium' },
        { weight: 5, value: 'low' },
      ]),
      profilePictureUrl: generateAvatarUrl(id),
      joinDate,
      lastLogin,
      stats: {
        totalHours: 0,
        cubesAttended: 0,
        veganConversions: 0,
        totalConversations: 0,
        cities: [],
      },
      badges: [],
      hostingAvailability: faker.datatype.boolean({ probability: 0.8 }), // Key users more likely to host
      hostingCapacity: faker.number.int({ min: 2, max: 5 }), // Higher capacity for key users
      ...overrides,
    };
  };

  if (count > 0)
    users.push(
      createKeyUser(Role.GODMODE, {
        name: 'Alex Chen (Founder)',
        chapters: chapters.map((c) => c.name),
      })
    );
  if (count > 1)
    users.push(
      createKeyUser(Role.GLOBAL_ADMIN, {
        name: 'Sarah Martinez (Global Coordinator)',
        chapters: chapters.map((c) => c.name),
      })
    );

  const numRegional = Math.min(
    countries.length,
    Math.floor(config.NUM_USERS / 25)
  );
  for (let i = 0; i < numRegional && users.length < count; i++) {
    const country = countries[i];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    users.push(
      createKeyUser(Role.REGIONAL_ORGANISER, {
        name: `${firstName} ${lastName}`,
        managedCountry: country,
        chapters: chapters
          .filter((c) => c.country === country)
          .map((c) => c.name),
      })
    );
  }

  chapters.forEach((chapter) => {
    const hasOrganiser = users.some((u) =>
      u.organiserOf?.includes(chapter.name)
    );
    if (!hasOrganiser && users.length < count) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      users.push(
        createKeyUser(Role.CHAPTER_ORGANISER, {
          name: `${firstName} ${lastName}`,
          organiserOf: [chapter.name],
          chapters: [chapter.name],
        })
      );
    }
  });

  while (users.length < count) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const id = nanoid();

    // More realistic onboarding status distribution
    const onboardingStatus = faker.helpers.weightedArrayElement([
      { weight: 75, value: OnboardingStatus.CONFIRMED },
      { weight: 10, value: OnboardingStatus.PENDING_APPLICATION_REVIEW },
      { weight: 8, value: OnboardingStatus.AWAITING_FIRST_CUBE },
      { weight: 5, value: OnboardingStatus.PENDING_ONBOARDING_CALL },
      { weight: 2, value: OnboardingStatus.DENIED },
    ]);

    const role =
      onboardingStatus === OnboardingStatus.CONFIRMED
        ? Role.ACTIVIST
        : Role.APPLICANT;

    // More realistic geographic distribution (people more likely to be in bigger chapters)
    const homeCountry = faker.helpers.weightedArrayElement([
      ...countries
        .slice(0, Math.min(5, countries.length))
        .map((country) => ({ weight: 3, value: country })), // Major countries
      ...countries.slice(5).map((country) => ({ weight: 1, value: country })), // Other countries
    ]);

    const chaptersInCountry = chapters
      .filter((c) => c.country === homeCountry)
      .map((c) => c.name);

    // Most users are in 1 chapter, some in 2, very few in more
    const numChapters = faker.helpers.weightedArrayElement([
      { weight: 70, value: 1 },
      { weight: 25, value: 2 },
      { weight: 5, value: Math.min(3, chaptersInCountry.length) },
    ]);

    const userChapters = faker.helpers.arrayElements(chaptersInCountry, {
      min: Math.min(numChapters, chaptersInCountry.length),
      max: Math.min(numChapters, chaptersInCountry.length),
    });

    // More realistic activity level distribution
    const activityLevel = faker.helpers.weightedArrayElement([
      { weight: 15, value: 'high' }, // Dedicated activists
      { weight: 45, value: 'medium' }, // Regular participants
      { weight: 40, value: 'low' }, // Occasional participants
    ]);

    // Realistic join date based on activity level
    const joinYearsAgo =
      activityLevel === 'high'
        ? faker.number.float({ min: 0.2, max: 3 }) // High activity users have been around longer
        : activityLevel === 'medium'
          ? faker.number.float({ min: 0.1, max: 2 }) // Medium activity mix of new and old
          : faker.number.float({ min: 0.05, max: 1.5 }); // Low activity mostly newer

    const joinDate = faker.date.past({ years: joinYearsAgo });

    // Last login correlates with activity level
    const maxDaysSinceLogin =
      activityLevel === 'high' ? 7 : activityLevel === 'medium' ? 30 : 120;
    const lastLogin = faker.date.recent({
      days: faker.number.int({ min: 1, max: maxDaysSinceLogin }),
    });

    const user: User = {
      id,
      name,
      email: faker.internet.email({ firstName, lastName }),
      role,
      chapters: userChapters,
      onboardingStatus,
      activityLevel,
      profilePictureUrl: generateAvatarUrl(id),
      joinDate,
      lastLogin,
      stats: {
        totalHours: 0,
        cubesAttended: 0,
        veganConversions: 0,
        totalConversations: 0,
        cities: [],
      },
      badges: [],
      // Hosting availability correlates with activity and experience
      hostingAvailability: faker.datatype.boolean({
        probability:
          activityLevel === 'high'
            ? 0.6
            : activityLevel === 'medium'
              ? 0.3
              : 0.1,
      }),
      hostingCapacity: faker.number.int({ min: 1, max: 4 }),
      // Instagram handle more likely for younger demographics and active users
      instagram: faker.datatype.boolean({
        probability:
          activityLevel === 'high'
            ? 0.8
            : activityLevel === 'medium'
              ? 0.6
              : 0.4,
      })
        ? `@${faker.internet.username({ firstName, lastName }).toLowerCase()}`
        : undefined,
    };

    if (onboardingStatus !== OnboardingStatus.CONFIRMED) {
      // More realistic onboarding answers
      const veganReasons = [
        "I became vegan after learning about factory farming conditions and couldn't continue supporting animal suffering.",
        'Environmental impact was my main driver - livestock agriculture is devastating our planet.',
        'Health benefits initially drew me in, but ethical concerns keep me committed long-term.',
        'Watching documentaries like Dominion and Earthlings opened my eyes to animal exploitation.',
        'I grew up vegetarian and veganism felt like the natural next step for consistency.',
        "Meeting farm sanctuary animals made me realize there's no difference between pets and farm animals.",
      ];

      const customAnswers = [
        "I'm excited to connect with like-minded people and learn how to be more effective in my advocacy.",
        'I want to help others make the transition to veganism in a supportive, non-judgmental way.',
        'I believe in grassroots activism and think Anonymous for the Voiceless is doing important work.',
        "I've been vegan for a while but want to get more involved in organized activism.",
        'I think cube demonstrations are a powerful way to educate people about animal agriculture.',
        'I want to develop my advocacy skills and help create a more compassionate world.',
      ];

      user.onboardingAnswers = {
        veganReason: faker.helpers.arrayElement(veganReasons),
        abolitionistAlignment: faker.datatype.boolean({ probability: 0.85 }), // Most align with abolitionist approach
        customAnswer: faker.helpers.arrayElement(customAnswers),
      };
    }
    users.push(user);
  }
  return users;
};

const generateEvents = (chapters: Chapter[], users: User[]): CubeEvent[] => {
  const events: CubeEvent[] = [];
  const confirmedUsers = users.filter(
    (u) => u.onboardingStatus === OnboardingStatus.CONFIRMED
  );
  faker.seed(EVENT_SEED);

  chapters.forEach((chapter) => {
    const eventCount = faker.number.int({
      min: config.EVENTS_PER_CHAPTER_MIN,
      max: config.EVENTS_PER_CHAPTER_MAX,
    });
    const chapterMembers = confirmedUsers.filter((u) =>
      u.chapters.includes(chapter.name)
    );
    const chapterOrganiser =
      chapterMembers.find(
        (u) =>
          u.role === Role.CHAPTER_ORGANISER &&
          u.organiserOf?.includes(chapter.name)
      ) ||
      chapterMembers.find(
        (u) =>
          u.role === Role.REGIONAL_ORGANISER &&
          u.managedCountry === chapter.country
      ) ||
      chapterMembers.find((u) => u.role === Role.GLOBAL_ADMIN) ||
      chapterMembers[0];

    if (!chapterOrganiser) return;

    for (let i = 0; i < eventCount; i++) {
      const startDate = generateRealisticEventDate();
      const isPast = startDate < new Date();

      const high = chapterMembers.filter((u) => u.activityLevel === 'high');
      const med = chapterMembers.filter((u) => u.activityLevel === 'medium');
      const low = chapterMembers.filter((u) => u.activityLevel === 'low');

      const participants = [
        ...faker.helpers.arrayElements(high, {
          min: Math.min(1, high.length),
          max: Math.min(10, high.length),
        }),
        ...faker.helpers.arrayElements(med, {
          min: Math.min(2, med.length),
          max: Math.min(15, med.length),
        }),
        ...faker.helpers.arrayElements(low, {
          min: 0,
          max: Math.min(3, low.length),
        }),
      ].map((user) => ({
        user,
        status: ParticipantStatus.ATTENDING,
        tourDuties: [] as TourDuty[],
      }));

      const uniqueParticipants = Array.from(
        new Map(participants.map((p) => [p.user.id, p])).values()
      );
      if (!uniqueParticipants.some((p) => p.user.id === chapterOrganiser.id)) {
        uniqueParticipants.push({
          user: chapterOrganiser,
          status: ParticipantStatus.ATTENDING,
          tourDuties: [],
        });
      }

      const event: CubeEvent = {
        id: nanoid(),
        name: `${chapter.name} Cube of Truth`,
        city: chapter.name,
        location: faker.location.streetAddress(),
        startDate,
        scope: 'Chapter',
        organizer: chapterOrganiser,
        participants: uniqueParticipants,
        status: isPast ? EventStatus.FINISHED : EventStatus.UPCOMING,
        report: isPast
          ? {
              hours: faker.number.int({ min: 2, max: 6 }),
              attendance: Object.fromEntries(
                uniqueParticipants.map((p) => [
                  p.user.id,
                  faker.helpers.weightedArrayElement([
                    { weight: 9, value: 'Attended' },
                    { weight: 1, value: 'Absent' },
                  ]),
                ])
              ),
            }
          : undefined,
      };
      events.push(event);
    }
  });
  return events;
};

const generateOutreachLogs = (users: User[], events: CubeEvent[]) => {
  const logs: OutreachLog[] = [];
  const pastEvents = events.filter((e) => e.status === EventStatus.FINISHED);

  pastEvents.forEach((event) => {
    event.participants.forEach((participant) => {
      const attended =
        event.report?.attendance[participant.user.id] === 'Attended';
      if (attended && faker.datatype.boolean({ probability: 0.8 })) {
        const mult =
          participant.user.activityLevel === 'high'
            ? 2
            : participant.user.activityLevel === 'medium'
              ? 1
              : 0.5;
        const logCount = faker.number.int({ min: 1, max: Math.ceil(8 * mult) });

        for (let i = 0; i < logCount; i++) {
          // More realistic outcome distribution based on real outreach data
          const outcome = faker.helpers.weightedArrayElement([
            { weight: 45, value: OutreachOutcome.NO_CHANGE }, // Most common - dismissive/no interest
            { weight: 25, value: OutreachOutcome.NOT_SURE }, // Uncertain/thinking about it
            { weight: 15, value: OutreachOutcome.MOSTLY_SURE }, // Positive response, likely to change
            { weight: 8, value: OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST }, // Already vegan, now interested in activism
            { weight: 5, value: OutreachOutcome.BECAME_VEGAN }, // Actually committed to veganism
            { weight: 2, value: OutreachOutcome.BECAME_VEGAN_ACTIVIST }, // Rare - both vegan and activist
          ]);

          // More realistic notes based on outcome
          let notes: string | undefined;
          if (faker.datatype.boolean({ probability: 0.3 })) {
            const notesByOutcome = {
              [OutreachOutcome.NO_CHANGE]: [
                "Said they 'need their meat' and walked away quickly",
                'Argued that animals are meant to be food',
                "Complained about 'vegan propaganda'",
                'Made jokes about bacon and left',
                "Watched briefly, said 'interesting' but clearly not interested",
                'Dismissive of environmental concerns',
              ],
              [OutreachOutcome.NOT_SURE]: [
                'Asked about protein sources and environmental impact',
                'Surprised by footage, seemed conflicted',
                'Said they need to think about it more',
                'Interested but concerned about practicality',
                'Acknowledged the message but seemed uncertain',
                'Asked thoughtful questions but made no commitments',
              ],
              [OutreachOutcome.MOSTLY_SURE]: [
                'Very engaged, asked for social media contacts',
                'Emotional response to footage, genuinely considering change',
                'Asked about transitioning gradually vs. all at once',
                'Wanted to know about local vegan community',
                'Took multiple leaflets for friends and family',
                'Interested in our starter guide and recipes',
              ],
              [OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST]: [
                'Vegan for 3 years, appreciated our work',
                'Plant-based for health, learning about ethics',
                'Long-time vegan, interested in getting involved',
                'Vegetarian for years, recently went fully vegan',
              ],
              [OutreachOutcome.BECAME_VEGAN]: [
                'Committed to trying plant-based for 30 days',
                "Said they're done with animal products starting today",
                'Asked for mentoring and support resources',
                'Already started reducing meat, ready to go fully vegan',
              ],
              [OutreachOutcome.BECAME_VEGAN_ACTIVIST]: [
                'Immediately wanted to join our next cube event',
                'Asked how to get trained as an activist',
                'Deeply moved by footage, wants to help others see truth',
                'Committed to veganism and spreading the message',
              ],
            };

            const possibleNotes = notesByOutcome[outcome] || [
              'Standard interaction',
            ];
            notes = faker.helpers.arrayElement(possibleNotes);
          }

          logs.push({
            id: nanoid(),
            userId: participant.user.id,
            eventId: event.id,
            outcome,
            notes,
            createdAt: event.startDate,
          });
        }
      }
    });
  });
  return logs;
};

const generateEventComments = (
  events: CubeEvent[],
  users: User[]
): EventComment[] => {
  const comments: EventComment[] = [];
  const pastEvents = events.filter(
    (e) => e.status === EventStatus.FINISHED && e.participants.length > 0
  );

  pastEvents.forEach((event) => {
    if (faker.datatype.boolean({ probability: 0.4 })) {
      const participants = event.participants
        .filter((p) => p.status === ParticipantStatus.ATTENDING)
        .map((p) => p.user)
        .filter((user) => users.some((u) => u.id === user.id));
      const commenters = faker.helpers.arrayElements(participants, {
        min: 1,
        max: 5,
      });
      commenters.forEach((author) => {
        comments.push({
          id: nanoid(),
          eventId: event.id,
          author,
          content: faker.lorem.sentence({ min: 5, max: 15 }),
          createdAt: faker.date.soon({ days: 2, refDate: event.startDate }),
        });
      });
    }
  });
  return comments;
};

const generateAccommodationRequests = (
  events: CubeEvent[],
  users: User[]
): { requests: AccommodationRequest[]; notifications: Notification[] } => {
  const requests: AccommodationRequest[] = [];
  const notifications: Notification[] = [];
  const upcomingEvents = events.filter(
    (e) => e.status === EventStatus.UPCOMING
  );

  upcomingEvents.forEach((event) => {
    const hosts = users.filter(
      (u) => u.hostingAvailability && u.chapters.includes(event.city)
    );
    if (hosts.length === 0) return;

    const travelers = event.participants
      .map((p) => p.user)
      .filter(
        (u) =>
          u.onboardingStatus === OnboardingStatus.CONFIRMED &&
          !u.chapters.includes(event.city)
      );

    travelers.forEach((traveler) => {
      if (faker.datatype.boolean({ probability: 0.3 })) {
        const host = faker.helpers.arrayElement(hosts);
        const status = faker.helpers.weightedArrayElement([
          { weight: 5, value: 'Pending' as const },
          { weight: 3, value: 'Accepted' as const },
          { weight: 2, value: 'Denied' as const },
        ]);
        const request: AccommodationRequest = {
          id: nanoid(),
          requester: traveler,
          host,
          event,
          startDate: faker.date.soon({
            days: 1,
            refDate: new Date(event.startDate).setDate(
              new Date(event.startDate).getDate() - 2
            ),
          }),
          endDate: faker.date.soon({ days: 1, refDate: event.startDate }),
          createdAt: faker.date.past({ years: 0.1 }),
          message: `Hey ${host.name.split(' ')[0]}, I'm coming for the cube in ${event.city} and was wondering if I could stay?`,
          status,
          hostReply: status !== 'Pending' ? faker.lorem.sentence() : undefined,
        };
        requests.push(request);

        notifications.push({
          id: nanoid(),
          userId: host.id,
          type: NotificationType.ACCOMMODATION_REQUEST,
          message: `${traveler.name} requested to stay for the ${event.city} event.`,
          linkTo: '/dashboard',
          isRead: faker.datatype.boolean(),
          createdAt: request.createdAt,
          relatedUser: traveler,
        });

        if (status !== 'Pending') {
          notifications.push({
            id: nanoid(),
            userId: traveler.id,
            type:
              status === 'Accepted'
                ? NotificationType.REQUEST_ACCEPTED
                : NotificationType.REQUEST_DENIED,
            message: `${host.name} ${status.toLowerCase()} your request to stay.`,
            linkTo: '/dashboard',
            isRead: faker.datatype.boolean(),
            createdAt: request.createdAt,
            relatedUser: host,
          });
        }
      }
    });
  });
  return { requests, notifications };
};

const generateAnnouncements = (
  count: number,
  users: User[],
  chapters: Chapter[]
) => {
  const announcements: Announcement[] = [];
  const organizers = users.filter((u) =>
    [
      Role.CHAPTER_ORGANISER,
      Role.REGIONAL_ORGANISER,
      Role.GLOBAL_ADMIN,
    ].includes(u.role)
  );

  for (let i = 0; i < count; i++) {
    const author = faker.helpers.arrayElement(organizers);
    const scope = faker.helpers.arrayElement(Object.values(AnnouncementScope));
    const announcement: Announcement = {
      id: nanoid(),
      author,
      scope,
      title: faker.lorem.sentence({ min: 3, max: 7 }),
      content: faker.lorem.paragraphs(2),
      createdAt: faker.date.past({ years: 1 }),
    };
    if (scope === 'Chapter')
      announcement.chapter = faker.helpers.arrayElement(chapters).name;
    if (scope === 'Regional')
      announcement.country = faker.helpers.arrayElement(chapters).country;
    announcements.push(announcement);
  }
  return announcements;
};

const generateResources = (count: number) => {
  const resources: Resource[] = [];
  for (let i = 0; i < count; i++) {
    resources.push({
      id: nanoid(),
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      type: faker.helpers.objectValue(ResourceType),
      skillLevel: faker.helpers.objectValue(SkillLevel),
      language: faker.helpers.arrayElement(['English', 'Spanish', 'German']),
      url: 'https://example.com',
      icon: faker.helpers.arrayElement([
        'BookOpenIcon',
        'DocumentTextIcon',
        'VideoCameraIcon',
      ]),
    });
  }
  return resources;
};

const generateInventory = (chapters: Chapter[]): InventoryItem[] => {
  const inventory: InventoryItem[] = [];
  chapters.forEach((chapter) => {
    inventory.push({
      id: nanoid(),
      chapterName: chapter.name,
      category: 'Masks',
      quantity: faker.number.int({ min: 10, max: 50 }),
    });
    inventory.push({
      id: nanoid(),
      chapterName: chapter.name,
      category: 'TVs',
      quantity: faker.number.int({ min: 1, max: 4 }),
    });
    inventory.push({
      id: nanoid(),
      chapterName: chapter.name,
      category: 'Signs',
      quantity: faker.number.int({ min: 5, max: 20 }),
    });
  });
  return inventory;
};

const generateChallenges = (
  count: number,
  chapters: Chapter[]
): Challenge[] => {
  const challenges: Challenge[] = [];
  for (let i = 0; i < count; i++) {
    challenges.push({
      id: nanoid(),
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      metric: faker.helpers.arrayElement(['Conversations', 'Hours']),
      goal: faker.number.int({ min: 100, max: 1000 }),
      endDate: faker.date.future({ years: 0.17 }),
      participants: faker.helpers
        .arrayElements(chapters, { min: 3, max: 10 })
        .map((c) => ({
          id: c.name,
          name: c.name,
          progress: faker.number.int({ min: 0, max: 800 }),
        })),
    });
  }
  return challenges;
};

const awardBadges = (
  users: User[]
): {
  updatedUsers: User[];
  badgeAwards: BadgeAward[];
  notifications: Notification[];
} => {
  const badgeAwards: BadgeAward[] = [];
  const notifications: Notification[] = [];
  const updatedUsers = users.map((user) => {
    const earnedBadges = user.badges || [];
    const checkAndAward = (badgeName: string, condition: boolean) => {
      if (condition && !earnedBadges.some((b) => b.name === badgeName)) {
        const template = BADGE_TEMPLATES.find((t) => t.name === badgeName);
        if (template)
          earnedBadges.push({
            ...template,
            id: nanoid(),
            awardedAt: new Date(),
          });
        notifications.push({
          id: nanoid(),
          userId: user.id,
          type: NotificationType.BADGE_AWARDED,
          message: `You've earned the "${badgeName}" badge. Recognition for your commitment.`,
          linkTo: `/members/${user.id}`,
          isRead: faker.datatype.boolean({ probability: 0.3 }),
          createdAt: new Date(),
        });
      }
    };

    checkAndAward('First Blood', user.stats.cubesAttended >= 1);
    checkAndAward('Nomad', new Set(user.stats.cities).size >= 5);
    checkAndAward('Voice of Truth', user.stats.totalConversations >= 100);
    checkAndAward('Centurion', user.stats.totalHours >= 100);
    checkAndAward('Veteran', user.stats.cubesAttended >= 25);

    if (
      user.role === Role.CHAPTER_ORGANISER ||
      user.role === Role.REGIONAL_ORGANISER
    ) {
      if (user.stats.cubesAttended >= 10 && user.stats.totalHours >= 50) {
        checkAndAward('Chapter Anchor', true);
      }

      if (
        user.stats.totalConversations >= 50 &&
        user.stats.veganConversions >= 5
      ) {
        checkAndAward('Guide', true);
      }
    }

    if (user.stats.cubesAttended >= 15 && user.activityLevel === 'high') {
      checkAndAward('Steel Resolve', true);
    }

    if (
      user.stats.totalConversations >= 75 &&
      user.stats.veganConversions >= 10
    ) {
      checkAndAward('Tactical Mind', true);
    }

    return { ...user, badges: earnedBadges };
  });
  return { updatedUsers, badgeAwards, notifications };
};

const generateNotificationsForApplicants = (users: User[]): Notification[] => {
  const notifications: Notification[] = [];
  const applicants = users.filter(
    (u) => u.onboardingStatus === OnboardingStatus.PENDING_APPLICATION_REVIEW
  );
  const organizers = users.filter((u) => u.role === Role.CHAPTER_ORGANISER);
  applicants.forEach((applicant) => {
    applicant.chapters.forEach((chapterName) => {
      organizers
        .filter((org) => org.organiserOf?.includes(chapterName))
        .forEach((organizer) => {
          notifications.push({
            id: nanoid(),
            userId: organizer.id,
            type: NotificationType.NEW_APPLICANT,
            message: `${applicant.name} has applied to join the ${chapterName} chapter.`,
            linkTo: '/manage',
            isRead: false,
            createdAt: applicant.joinDate || new Date(),
            relatedUser: applicant,
          });
        });
    });
  });
  return notifications;
};

const calculateAllStats = (
  users: User[],
  events: CubeEvent[],
  outreachLogs: OutreachLog[]
): User[] => {
  console.log('📊 Calculating user stats from generated data...');
  const userStatsMap: Record<string, User['stats']> = {};

  users.forEach(
    (u) =>
      (userStatsMap[u.id] = {
        totalHours: 0,
        cubesAttended: 0,
        totalConversations: 0,
        veganConversions: 0,
        cities: [],
      })
  );

  events.forEach((event) => {
    if (event.status === 'Finished' && event.report) {
      Object.entries(event.report.attendance).forEach(([userId, status]) => {
        if (status === 'Attended' && userStatsMap[userId]) {
          userStatsMap[userId].totalHours += event.report!.hours;
          userStatsMap[userId].cubesAttended += 1;
          userStatsMap[userId].cities.push(event.city);
        }
      });
    }
  });

  outreachLogs.forEach((log) => {
    if (userStatsMap[log.userId]) {
      userStatsMap[log.userId].totalConversations += 1;
      if (
        [
          OutreachOutcome.BECAME_VEGAN,
          OutreachOutcome.BECAME_VEGAN_ACTIVIST,
        ].includes(log.outcome)
      ) {
        userStatsMap[log.userId].veganConversions += 1;
      }
    }
  });

  return users.map((user) => ({
    ...user,
    stats: {
      ...userStatsMap[user.id],
      cities: [...new Set(userStatsMap[user.id].cities)],
    },
  }));
};

const generateAll = () => {
  console.log('1. Generating Chapters...');
  const chapters = generateChapters(config.NUM_CHAPTERS);

  console.log('2. Generating Users (with realistic roles)...');
  let users = generateUsers(config.NUM_USERS, chapters);

  console.log('3. Generating Events and Outreach Logs...');
  const events = generateEvents(chapters, users);
  const outreachLogs = generateOutreachLogs(users, events);

  console.log('4. Calculating derived User Stats...');
  users = calculateAllStats(users, events, outreachLogs);

  console.log('5. Awarding Badges...');
  const {
    updatedUsers,
    badgeAwards,
    notifications: badgeNotifications,
  } = awardBadges(users);
  users = updatedUsers;

  console.log('6. Generating remaining interconnected data...');
  const announcements = generateAnnouncements(
    config.ANNOUNCEMENTS,
    users,
    chapters
  );
  const resources = generateResources(config.RESOURCES);
  const eventComments = generateEventComments(events, users);
  const {
    requests: accommodationRequests,
    notifications: accommodationNotifications,
  } = generateAccommodationRequests(events, users);
  const applicantNotifications = generateNotificationsForApplicants(users);
  const notifications = [
    ...applicantNotifications,
    ...badgeNotifications,
    ...accommodationNotifications,
  ];
  const inventory = generateInventory(chapters);
  const challenges = generateChallenges(config.CHALLENGES, chapters);

  console.log('7. Writing data to file...');
  writeDataToFile({
    chapters,
    users,
    events,
    outreachLogs,
    announcements,
    resources,
    notifications,
    badgeAwards,
    inventory,
    challenges,
    accommodationRequests,
    eventComments,
  });

  console.log(`\n🎉 Success! Generated mock data for '${env}' environment.`);
};

generateAll();
