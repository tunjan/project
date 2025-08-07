

import { Role, EventRole, EventStatus, type User, type CubeEvent, type Badge, OnboardingStatus, type Chapter, type Announcement, AnnouncementScope, type Resource, ResourceType, SkillLevel, type AccommodationRequest, OutreachOutcome, type OutreachLog, type EventComment, type Notification, NotificationType } from './types';
import { StarIcon, FireIcon, GlobeAltIcon, ShieldCheckIcon, DocumentTextIcon, VideoCameraIcon } from './components/icons';

export const CHAPTERS: Chapter[] = [
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6895, lng: 139.6917 },
  { name: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241 },
];

export const BADGES: Record<string, Badge> = {
  CUBE_10: { id: 'b1', name: 'Cube Veteran', description: 'Attended 10+ cubes.', icon: StarIcon },
  CUBE_25: { id: 'b2', name: 'Cube Stalwart', description: 'Attended 25+ cubes.', icon: StarIcon },
  CUBE_50: { id: 'b3', name: 'Cube Legend', description: 'Attended 50+ cubes.', icon: StarIcon },
  HOURS_100: { id: 'b4', name: 'Century Volunteer', description: 'Contributed 100+ hours.', icon: FireIcon },
  MULTI_CITY: { id: 'b5', name: 'City Traveler', description: 'Active in 2+ cities.', icon: GlobeAltIcon },
  GLOBAL_ACTIVIST: { id: 'b6', name: 'Global Activist', description: 'Active in 5+ cities.', icon: GlobeAltIcon },
  ORGANIZER: { id: 'b7', name: 'Chapter Organizer', description: 'Leads a local chapter.', icon: ShieldCheckIcon },
};

const assignBadges = (user: Omit<User, 'badges' | 'onboardingStatus' | 'onboardingAnswers' | 'profilePictureUrl' | 'report'> & { profilePictureUrl?: string }): Badge[] => {
  const userBadges: Badge[] = [];
  if (user.stats.cubesAttended >= 50) userBadges.push(BADGES.CUBE_50);
  else if (user.stats.cubesAttended >= 25) userBadges.push(BADGES.CUBE_25);
  else if (user.stats.cubesAttended >= 10) userBadges.push(BADGES.CUBE_10);

  if (user.stats.totalHours >= 100) userBadges.push(BADGES.HOURS_100);

  if (user.stats.cities.length >= 5) userBadges.push(BADGES.GLOBAL_ACTIVIST);
  else if (user.stats.cities.length >= 2) userBadges.push(BADGES.MULTI_CITY);

  if (user.role === Role.CHAPTER_ORGANISER || user.role === Role.REGIONAL_ORGANISER || user.role === Role.GLOBAL_ADMIN || user.role === Role.GODMODE) userBadges.push(BADGES.ORGANIZER);

  return userBadges;
}

const USERS_DATA: Omit<User, 'badges' | 'profilePictureUrl'>[] = [
  {
    id: 'user_1',
    name: 'Alex Chen',
    role: Role.CHAPTER_ORGANISER,
    instagram: 'alex.v.chen',
    chapters: ['New York'],
    organiserOf: ['New York'],
    stats: { totalHours: 150, cubesAttended: 32, veganConversions: 80, cities: ['New York', 'Boston', 'Philadelphia'] },
    hostingAvailability: true,
    hostingCapacity: 2,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_2',
    name: 'Maria Garcia',
    role: Role.CONFIRMED_ACTIVIST,
    instagram: 'maria.garcia.activism',
    chapters: ['New York'],
    stats: { totalHours: 80, cubesAttended: 15, veganConversions: 45, cities: ['New York'] },
    hostingAvailability: false,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_3',
    name: 'David Smith',
    role: Role.CONFIRMED_ACTIVIST,
    chapters: ['London'],
    stats: { totalHours: 25, cubesAttended: 5, veganConversions: 10, cities: ['London', 'Manchester'] },
    hostingAvailability: true,
    hostingCapacity: 1,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_4',
    name: 'Priya Patel',
    role: Role.CHAPTER_ORGANISER,
    instagram: 'priya.activist',
    chapters: ['London', 'Paris'],
    organiserOf: ['London', 'Paris'],
    stats: { totalHours: 200, cubesAttended: 50, veganConversions: 120, cities: ['London', 'Manchester', 'Birmingham', 'Paris'] },
    hostingAvailability: false,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_5',
    name: 'Kenji Tanaka',
    role: Role.CONFIRMED_ACTIVIST,
    chapters: ['Tokyo'],
    stats: { totalHours: 110, cubesAttended: 22, veganConversions: 60, cities: ['Tokyo'] },
    hostingAvailability: false,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_6',
    name: 'Chloe Williams',
    role: Role.REGIONAL_ORGANISER,
    managedCountry: 'UK',
    instagram: 'chloe.regional',
    chapters: ['London'],
    stats: { totalHours: 500, cubesAttended: 100, veganConversions: 300, cities: ['New York', 'London', 'Paris', 'Berlin', 'Tokyo'] },
    hostingAvailability: true,
    hostingCapacity: 3,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_7',
    name: 'Samira Ahmed',
    role: Role.ACTIVIST,
    chapters: ['New York'],
    stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
    hostingAvailability: false,
    onboardingStatus: 'Pending',
    onboardingAnswers: {
      veganReason: "I watched Dominion and couldn't ignore the truth anymore. I want to dedicate my time to helping animals.",
      abolitionistAlignment: true,
      customAnswer: "I'm a graphic designer and can help create visuals for our chapter."
    }
  },
  {
    id: 'user_8',
    name: 'Ben Carter',
    role: Role.ACTIVIST,
    chapters: ['London'],
    stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
    hostingAvailability: true,
    hostingCapacity: 1,
    onboardingStatus: 'Pending',
    onboardingAnswers: {
      veganReason: "For the environment and for my health initially, but now it's 100% for the animals.",
      abolitionistAlignment: true,
      customAnswer: "I have experience with public speaking and would be comfortable in an outreach role."
    }
  },
  {
    id: 'user_9',
    name: 'Admin User',
    role: Role.GLOBAL_ADMIN,
    chapters: [],
    stats: { totalHours: 1000, cubesAttended: 200, veganConversions: 500, cities: ['Multiple'] },
    hostingAvailability: false,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_10',
    name: 'Lena Weber',
    role: Role.CHAPTER_ORGANISER,
    chapters: ['Berlin'],
    organiserOf: ['Berlin'],
    stats: { totalHours: 180, cubesAttended: 40, veganConversions: 90, cities: ['Berlin'] },
    hostingAvailability: true,
    hostingCapacity: 2,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_11',
    name: 'Liam Smith',
    role: Role.CHAPTER_ORGANISER,
    chapters: ['Sydney'],
    organiserOf: ['Sydney'],
    stats: { totalHours: 160, cubesAttended: 35, veganConversions: 85, cities: ['Sydney'] },
    hostingAvailability: true,
    hostingCapacity: 1,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_12',
    name: 'Hiroshi Sato',
    role: Role.CONFIRMED_ACTIVIST,
    chapters: ['Tokyo'],
    stats: { totalHours: 90, cubesAttended: 18, veganConversions: 55, cities: ['Tokyo'] },
    hostingAvailability: true,
    hostingCapacity: 1,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_13',
    name: 'Fatima Zahra',
    role: Role.CHAPTER_ORGANISER,
    chapters: ['Cairo'],
    organiserOf: ['Cairo'],
    stats: { totalHours: 40, cubesAttended: 8, veganConversions: 20, cities: ['Cairo'] },
    hostingAvailability: false,
    onboardingStatus: 'Confirmed',
    onboardingAnswers: {
      veganReason: "Inspired by the ethical arguments and environmental benefits.",
      abolitionistAlignment: true,
      customAnswer: "I can help with local community outreach and event planning."
    }
  },
  {
    id: 'user_16',
    name: 'Aisha Khan',
    role: Role.CONFIRMED_ACTIVIST,
    chapters: ['London'],
    stats: { totalHours: 70, cubesAttended: 14, veganConversions: 35, cities: ['London'] },
    hostingAvailability: false,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_17',
    name: 'Marco Rossi',
    role: Role.ACTIVIST,
    chapters: ['Rome'],
    stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
    hostingAvailability: true,
    hostingCapacity: 1,
    onboardingStatus: 'Pending',
    onboardingAnswers: {
      veganReason: "For the animals, always. I want to be a voice for the voiceless.",
      abolitionistAlignment: true,
      customAnswer: "I'm a musician and can help organize benefit concerts."
    }
  },
  {
    id: 'user_18',
    name: 'Chen Wei',
    role: Role.CONFIRMED_ACTIVIST,
    chapters: ['Shanghai'],
    stats: { totalHours: 130, cubesAttended: 28, veganConversions: 70, cities: ['Shanghai'] },
    hostingAvailability: false,
    onboardingStatus: 'Confirmed',
  },
  {
    id: 'user_20',
    name: 'Juan Martinez',
    role: Role.CHAPTER_ORGANISER,
    chapters: ['Mexico City'],
    organiserOf: ['Mexico City'],
    stats: { totalHours: 95, cubesAttended: 19, veganConversions: 50, cities: ['Mexico City'] },
    hostingAvailability: false,
    onboardingStatus: 'Confirmed',
  }
];

export const USERS: User[] = USERS_DATA.map((u, index) => (
  {
    ...u,
    profilePictureUrl: `https://picsum.photos/seed/user${index + 1}/100/100`,
    badges: assignBadges(u)
  }));

export const CUBE_EVENTS: CubeEvent[] = [
  {
    id: 'event_1',
    city: 'New York',
    location: 'Times Square',
    dateTime: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    organizer: USERS.find(u => u.id === 'user_1')!,
    participants: [
      { user: USERS.find(u => u.id === 'user_1')!, eventRole: EventRole.ORGANIZER },
      { user: USERS.find(u => u.id === 'user_2')!, eventRole: EventRole.OUTREACH },
    ],
    status: EventStatus.FINISHED,
  },
  {
    id: 'event_2',
    city: 'London',
    location: 'Trafalgar Square',
    dateTime: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    organizer: USERS.find(u => u.id === 'user_4')!,
    participants: [
      { user: USERS.find(u => u.id === 'user_4')!, eventRole: EventRole.ORGANIZER },
      { user: USERS.find(u => u.id === 'user_3')!, eventRole: EventRole.VOLUNTEER },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: 'event_3',
    city: 'New York',
    location: 'Union Square',
    dateTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    organizer: USERS.find(u => u.id === 'user_1')!,
    participants: [
      { user: USERS.find(u => u.id === 'user_1')!, eventRole: EventRole.ORGANIZER },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: 'event_4',
    city: 'Paris',
    location: 'Place de la République',
    dateTime: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    organizer: USERS.find(u => u.id === 'user_4')!,
    participants: [
      { user: USERS.find(u => u.id === 'user_4')!, eventRole: EventRole.ORGANIZER },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: 'event_5',
    city: 'Berlin',
    location: 'Brandenburg Gate',
    dateTime: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    organizer: USERS.find(u => u.id === 'user_10')!,
    participants: [
      { user: USERS.find(u => u.id === 'user_10')!, eventRole: EventRole.ORGANIZER },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: 'event_6',
    city: 'Tokyo',
    location: 'Shibuya Crossing',
    dateTime: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    organizer: USERS.find(u => u.id === 'user_5')!,
    participants: [
      { user: USERS.find(u => u.id === 'user_5')!, eventRole: EventRole.ORGANIZER },
      { user: USERS.find(u => u.id === 'user_12')!, eventRole: EventRole.OUTREACH },
    ],
    status: EventStatus.FINISHED,
  },
  {
    id: 'event_7',
    city: 'Sydney',
    location: 'Opera House',
    dateTime: new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    organizer: USERS.find(u => u.id === 'user_11')!,
    participants: [
      { user: USERS.find(u => u.id === 'user_11')!, eventRole: EventRole.ORGANIZER },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: 'event_8',
    city: 'Cairo',
    location: 'Tahrir Square',
    dateTime: new Date(new Date().getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    organizer: USERS.find(u => u.id === 'user_13')!,
    participants: [
      { user: USERS.find(u => u.id === 'user_13')!, eventRole: EventRole.ORGANIZER },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: 'event_9',
    city: 'Mexico City',
    location: 'Zócalo',
    dateTime: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    organizer: USERS.find(u => u.id === 'user_20')!,
    participants: [
      { user: USERS.find(u => u.id === 'user_20')!, eventRole: EventRole.ORGANIZER },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: 'event_10',
    city: 'Rio de Janeiro',
    location: 'Copacabana Beach',
    dateTime: new Date(new Date().getTime() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
    organizer: USERS.find(u => u.id === 'user_9')!, // Global Admin organizing
    participants: [
      { user: USERS.find(u => u.id === 'user_9')!, eventRole: EventRole.ORGANIZER },
    ],
    status: EventStatus.UPCOMING,
  }
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anno_1',
    author: USERS.find(u => u.id === 'user_9')!,
    scope: AnnouncementScope.GLOBAL,
    title: "Welcome to the New Vegan Action Hub!",
    content: "We're excited to launch this platform to streamline our activism and amplify our impact. Please familiarize yourself with the features.",
    createdAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'anno_2',
    author: USERS.find(u => u.id === 'user_6')!,
    scope: AnnouncementScope.REGIONAL,
    country: 'UK',
    title: "UK Activism Summit - Call for Speakers",
    content: "We are planning a regional summit for all UK chapters. If you're interested in speaking or helping to organize, please reach out.",
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'anno_3',
    author: USERS.find(u => u.id === 'user_1')!,
    scope: AnnouncementScope.CHAPTER,
    chapter: 'New York',
    title: "New Outreach Materials Available",
    content: "Updated leaflets and cards have been added to the Resources section. Please review them before the next Cube event.",
    createdAt: new Date(new Date().getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
  },
  {
    id: 'anno_4',
    author: USERS.find(u => u.id === 'user_4')!,
    scope: AnnouncementScope.CHAPTER,
    chapter: 'London',
    title: "Post-Cube Social this Saturday",
    content: "Join us for a casual social gathering after the Trafalgar Square cube this weekend. Location to be announced at the event.",
    createdAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: 'anno_5',
    author: USERS.find(u => u.id === 'user_10')!,
    scope: AnnouncementScope.CHAPTER,
    chapter: 'Berlin',
    title: "New Chapter Meeting Point",
    content: "Our regular meeting point has changed. Please check the chapter details for the new location.",
    createdAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'anno_6',
    author: USERS.find(u => u.id === 'user_5')!,
    scope: AnnouncementScope.CHAPTER,
    chapter: 'Tokyo',
    title: "Volunteer Training Session",
    content: "We're holding a new volunteer training session next Tuesday. All new and existing volunteers are welcome.",
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'anno_7',
    author: USERS.find(u => u.id === 'user_20')!,
    scope: AnnouncementScope.CHAPTER,
    chapter: 'Mexico City',
    title: "First Cube of Truth in Mexico City!",
    content: "Join us for our inaugural Cube of Truth event in Zócalo. All activists welcome!",
    createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 'anno_8',
    author: USERS.find(u => u.id === 'user_9')!,
    scope: AnnouncementScope.GLOBAL,
    title: "New Global Campaign: #GoVeganForEarth",
    content: "We are launching a new global campaign focusing on the environmental impact of animal agriculture. Get involved!",
    createdAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  }
];

export const RESOURCES: Resource[] = [
  {
    id: 'res_1',
    title: 'Cube of Truth: Core Protocol',
    description: 'The foundational document outlining the structure, roles, and procedures for conducting a Cube of Truth.',
    type: ResourceType.DOCUMENT,
    skillLevel: SkillLevel.BEGINNER,
    language: 'English',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_2',
    title: 'Effective Outreach Conversations Masterclass',
    description: 'A video masterclass on how to engage with the public, handle common questions, and guide conversations effectively.',
    type: ResourceType.VIDEO,
    skillLevel: SkillLevel.INTERMEDIATE,
    language: 'English',
    url: '#',
    icon: VideoCameraIcon,
  },
  {
    id: 'res_3',
    title: 'Organizer Quick-Start Guide',
    description: 'A step-by-step guide for new Chapter Organizers on how to plan, schedule, and manage their first Cube.',
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.INTERMEDIATE,
    language: 'English',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_4',
    title: 'Protocolo del Cubo de la Verdad',
    description: 'El documento fundamental que describe la estructura, los roles y los procedimientos para realizar un Cubo de la Verdad.',
    type: ResourceType.DOCUMENT,
    skillLevel: SkillLevel.BEGINNER,
    language: 'Spanish',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_5',
    title: 'Advanced Security Protocols',
    description: 'A comprehensive document on de-escalation techniques and security best practices for high-traffic locations.',
    type: ResourceType.DOCUMENT,
    skillLevel: SkillLevel.ADVANCED,
    language: 'English',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_6',
    title: 'Printable Outreach Materials (All Languages)',
    description: 'A collection of high-resolution, print-ready leaflet and business card designs.',
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.BEGINNER,
    language: 'Multilingual',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_7',
    title: 'Vegan Nutrition Basics',
    description: 'A guide to essential nutrients and meal planning for a healthy vegan diet.',
    type: ResourceType.DOCUMENT,
    skillLevel: SkillLevel.BEGINNER,
    language: 'English',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_8',
    title: 'Social Media for Activists',
    description: 'Tips and strategies for effective online activism and growing your reach.',
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.INTERMEDIATE,
    language: 'English',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_9',
    title: 'Legal Rights of Activists',
    description: 'Understanding your rights and responsibilities during protests and outreach events.',
    type: ResourceType.DOCUMENT,
    skillLevel: SkillLevel.ADVANCED,
    language: 'English',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_10',
    title: 'Fundraising Strategies for Chapters',
    description: 'Ideas and best practices for raising funds to support your chapters activities.',
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.INTERMEDIATE,
    language: 'English',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_11',
    title: 'Guide to Effective Leafleting',
    description: 'Best practices for distributing leaflets and engaging with the public.',
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.BEGINNER,
    language: 'English',
    url: '#',
    icon: DocumentTextIcon,
  },
  {
    id: 'res_12',
    title: 'Understanding Speciesism',
    description: 'An in-depth look at the concept of speciesism and its implications.',
    type: ResourceType.DOCUMENT,
    skillLevel: SkillLevel.ADVANCED,
    language: 'English',
    url: '#',
    icon: DocumentTextIcon,
  }
];

export const ACCOMMODATION_REQUESTS: AccommodationRequest[] = [
  {
    id: 'req_1',
    requester: USERS.find(u => u.id === 'user_5')!, // Kenji from Tokyo
    host: USERS.find(u => u.id === 'user_1')!, // Alex from New York
    event: CUBE_EVENTS.find(e => e.id === 'event_3')!, // Union Square, New York
    startDate: new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000),
    endDate: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000),
    message: "Hi Alex, I'm planning to visit NYC for the Union Square cube and would be very grateful if I could stay. I'm very tidy and quiet. Thanks for considering!",
    status: 'Pending',
  },
  {
    id: 'req_2',
    requester: USERS.find(u => u.id === 'user_3')!, // David from London
    host: USERS.find(u => u.id === 'user_10')!, // Lena from Berlin
    event: CUBE_EVENTS.find(e => e.id === 'event_5')!, // Brandenburg Gate, Berlin
    startDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
    endDate: new Date(new Date().getTime() + 16 * 24 * 60 * 60 * 1000),
    message: "Hello Lena, I'd love to attend the Berlin cube. Do you have space for a fellow activist for a couple of nights?",
    status: 'Pending',
  },
  {
    id: 'req_3',
    requester: USERS.find(u => u.id === 'user_13')!, // Fatima from Cairo
    host: USERS.find(u => u.id === 'user_1')!, // Alex from New York
    event: CUBE_EVENTS.find(e => e.id === 'event_3')!, // Union Square, New York
    startDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    message: "Hi Alex, I'm visiting from Cairo and would appreciate a place to stay for the Union Square event. I'm very respectful.",
    status: 'Pending',
  }
];

export const OUTREACH_LOGS: OutreachLog[] = [
  {
    id: 'out_1',
    userId: 'user_1',
    eventId: 'event_1',
    outcome: OutreachOutcome.MOSTLY_SURE,
    notes: 'A couple seemed very receptive and took a card. They said they would watch Dominion tonight.',
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'out_2',
    userId: 'user_2',
    eventId: 'event_1',
    outcome: OutreachOutcome.NO_CHANGE,
    notes: 'A man was very dismissive from the start, just walked by laughing.',
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000 + 10000),
  },
  {
    id: 'out_3',
    userId: 'user_2',
    eventId: 'event_1',
    outcome: OutreachOutcome.BECAME_VEGAN,
    notes: 'A young woman cried and said she was going vegan on the spot. I gave her resources and our chapter info.',
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000 + 20000),
  },
  {
    id: 'out_5',
    userId: 'user_5',
    eventId: 'event_6',
    outcome: OutreachOutcome.MOSTLY_SURE,
    notes: 'Had a good conversation with a tourist who was interested in documentaries.',
    createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000 + 40000),
  },
  {
    id: 'out_6',
    userId: 'user_12',
    eventId: 'event_6',
    outcome: OutreachOutcome.BECAME_VEGAN,
    notes: 'A person decided to go vegan after a long discussion about animal ethics.',
    createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000 + 50000),
  }
];

export const EVENT_COMMENTS: EventComment[] = [
  {
    id: 'comment_1',
    eventId: 'event_1', // Times Square event (past)
    author: USERS.find(u => u.id === 'user_2')!, // Maria
    content: "It was a great event! The outreach was very effective.",
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000 + 3600 * 1000), // 1 hour after event start
  },
  {
    id: 'comment_2',
    eventId: 'event_1',
    author: USERS.find(u => u.id === 'user_1')!, // Alex (organizer)
    content: "Couldn't agree more, Maria. Thanks for your hard work!",
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000 + 3700 * 1000), // a bit after Maria
  },
  {
    id: 'comment_3',
    eventId: 'event_2', // Trafalgar Square (upcoming)
    author: USERS.find(u => u.id === 'user_3')!, // David
    content: "Looking forward to this one! Is anyone driving from the south and has space for one more?",
    createdAt: new Date(),
  },
  {
    id: 'comment_4',
    eventId: 'event_5', // Brandenburg Gate (upcoming)
    author: USERS.find(u => u.id === 'user_10')!, // Lena
    content: "Excited for our first cube at Brandenburg Gate! Let's make it a big one.",
    createdAt: new Date(),
  },
  {
    id: 'comment_5',
    eventId: 'event_7', // Sydney Opera House (upcoming)
    author: USERS.find(u => u.id === 'user_11')!, // Liam
    content: "Can't wait for the Sydney event! Who else is coming?",
    createdAt: new Date(),
  }
];

export const DELETED_USER: User = {
  id: 'user_deleted',
  name: 'Deleted User',
  role: Role.ACTIVIST,
  chapters: [],
  stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
  profilePictureUrl: '',
  badges: [],
  hostingAvailability: false,
  onboardingStatus: 'Confirmed',
};

const generateInitialNotifications = (users: User[], announcements: Announcement[], accommodationRequests: AccommodationRequest[]): Notification[] => {
  const notifications: Notification[] = [];

  const globalAnnouncement = announcements.find(a => a.scope === AnnouncementScope.GLOBAL)!;
  users.filter(u => u.id !== globalAnnouncement.author.id && u.onboardingStatus === 'Confirmed').slice(0, 2).forEach((user, index) => {
    notifications.push({
      id: `notif_${3 + index}`,
      userId: user.id,
      type: NotificationType.NEW_ANNOUNCEMENT,
      message: `Global announcement: "${globalAnnouncement.title}"`,
      linkTo: 'announcements',
      isRead: index % 2 === 0,
      createdAt: globalAnnouncement.createdAt,
      relatedUser: globalAnnouncement.author,
    })
  });

  const londonAnnouncement = announcements.find(a => a.chapter === 'London');
  if (londonAnnouncement) {
    notifications.push({
      id: 'notif_5',
      userId: 'user_3',
      type: NotificationType.NEW_ANNOUNCEMENT,
      message: `New in London: "${londonAnnouncement.title}"`,
      linkTo: 'announcements',
      isRead: true,
      createdAt: londonAnnouncement.createdAt,
      relatedUser: londonAnnouncement.author,
    });
  }

  const berlinAnnouncement = announcements.find(a => a.chapter === 'Berlin');
  if (berlinAnnouncement) {
    notifications.push({
      id: 'notif_6',
      userId: 'user_10',
      type: NotificationType.NEW_ANNOUNCEMENT,
      message: `New in Berlin: "${berlinAnnouncement.title}"`,
      linkTo: 'announcements',
      isRead: false,
      createdAt: berlinAnnouncement.createdAt,
      relatedUser: berlinAnnouncement.author,
    });
  }

  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const NOTIFICATIONS: Notification[] = generateInitialNotifications(USERS, ANNOUNCEMENTS, ACCOMMODATION_REQUESTS);