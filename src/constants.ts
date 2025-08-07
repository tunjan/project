import {
  User,
  CubeEvent,
  Announcement,
  Resource,
  Chapter,
  Badge,
  Role,
  EventRole,
  EventStatus,
  OnboardingStatus,
  AnnouncementScope,
  ResourceType,
  SkillLevel,
  AccommodationRequest,
  OutreachLog,
  EventComment,
  Notification,
  NotificationType,
  OutreachOutcome,
} from "./types";
import {
  FireIcon,
  GlobeAltIcon,
  StarIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  BookOpenIcon,
} from "./icons";

const badges: Record<string, Badge> = {
  firstCube: {
    id: "badge1",
    name: "First Cube",
    description: "Attended your first Cube of Truth.",
    icon: FireIcon,
  },
  tenCubes: {
    id: "badge2",
    name: "Seasoned Activist",
    description: "Attended 10 Cubes of Truth.",
    icon: StarIcon,
  },
  globalTraveler: {
    id: "badge3",
    name: "Global Traveler",
    description: "Attended cubes in 3 different countries.",
    icon: GlobeAltIcon,
  },
};

const chapters: Chapter[] = [
  {
    name: "London",
    country: "United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    instagram: "@av.london",
  },
  {
    name: "New York",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
    instagram: "@av.newyork",
  },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  {
    name: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    instagram: "@av.sydney",
  },
  { name: "Tokyo", country: "Japan", lat: 35.6895, lng: 139.6917 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  {
    name: "Los Angeles",
    country: "USA",
    lat: 34.0522,
    lng: -118.2437,
  },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
];

export const USERS_DATA: Omit<User, "profilePictureUrl" | "badges">[] = [
  {
    id: "user_1",
    name: "Alex Organizer",
    role: Role.CHAPTER_ORGANISER,
    instagram: "alex_organizer_av",
    chapters: ["London"],
    organiserOf: ["London"],
    onboardingStatus: OnboardingStatus.CONFIRMED,
    stats: {
      totalHours: 150,
      cubesAttended: 25,
      veganConversions: 30,
      cities: ["London", "Paris"],
    },
    hostingAvailability: true,
    hostingCapacity: 2,
    joinDate: new Date("2023-01-15"),
  },
  {
    id: "user_2",
    name: "Ben Regional",
    role: Role.REGIONAL_ORGANISER,
    managedCountry: "USA",
    chapters: ["New York", "Los Angeles"],
    onboardingStatus: OnboardingStatus.CONFIRMED,
    stats: {
      totalHours: 400,
      cubesAttended: 50,
      veganConversions: 80,
      cities: ["New York", "Los Angeles", "London"],
    },
    hostingAvailability: false,
    joinDate: new Date("2022-05-20"),
  },
  {
    id: "user_3",
    name: "Charlie Global",
    role: Role.GLOBAL_ADMIN,
    chapters: ["London", "New York", "Berlin", "Sydney"],
    onboardingStatus: OnboardingStatus.CONFIRMED,
    stats: {
      totalHours: 1000,
      cubesAttended: 100,
      veganConversions: 250,
      cities: ["London", "New York", "Berlin", "Sydney", "Tokyo", "Paris"],
    },
    hostingAvailability: true,
    hostingCapacity: 4,
    joinDate: new Date("2021-08-10"),
  },
  {
    id: "user_4",
    name: "Diana Activist",
    role: Role.CONFIRMED_ACTIVIST,
    chapters: ["Berlin"],
    onboardingStatus: OnboardingStatus.CONFIRMED,
    stats: {
      totalHours: 50,
      cubesAttended: 10,
      veganConversions: 5,
      cities: ["Berlin"],
    },
    hostingAvailability: false,
    joinDate: new Date("2023-09-01"),
  },
  {
    id: "user_5",
    name: "Ethan Pending",
    role: Role.ACTIVIST,
    chapters: ["Sydney"],
    onboardingStatus: OnboardingStatus.PENDING,
    onboardingAnswers: {
      veganReason: "For the animals, after watching Dominion.",
      abolitionistAlignment: true,
      customAnswer: "I have experience with graphic design and social media.",
    },
    stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
    hostingAvailability: false,
    joinDate: new Date("2024-02-20"),
  },
  {
    id: "user_6",
    name: "Fiona Verified",
    role: Role.CONFIRMED_ACTIVIST,
    chapters: ["London", "Paris"],
    onboardingStatus: OnboardingStatus.CONFIRMED,
    stats: {
      totalHours: 80,
      cubesAttended: 15,
      veganConversions: 12,
      cities: ["London", "Paris"],
    },
    hostingAvailability: true,
    hostingCapacity: 1,
    joinDate: new Date("2023-06-12"),
  },
  {
    id: "user_7",
    name: "George Godmode",
    role: Role.GODMODE,
    chapters: [],
    onboardingStatus: OnboardingStatus.CONFIRMED,
    stats: {
      totalHours: 9999,
      cubesAttended: 500,
      veganConversions: 1000,
      cities: ["Everywhere"],
    },
    hostingAvailability: true,
    hostingCapacity: 10,
    joinDate: new Date("2020-01-01"),
  },
  {
    id: "user_8",
    name: "Hannah Awaiting",
    role: Role.ACTIVIST,
    chapters: ["New York"],
    onboardingStatus: OnboardingStatus.AWAITING_VERIFICATION,
    stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
    hostingAvailability: false,
    joinDate: new Date("2024-01-15"),
  },
  {
    id: "user_9",
    name: "Ian Newbie",
    role: Role.ACTIVIST,
    chapters: ["Toronto"],
    onboardingStatus: OnboardingStatus.PENDING,
    onboardingAnswers: {
      veganReason: "Health reasons initially, now ethics too.",
      abolitionistAlignment: false,
      customAnswer: "I'm available every weekend and can help with setup.",
    },
    stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
    hostingAvailability: false,
    joinDate: new Date("2024-03-01"),
  },
  {
    id: "user_10",
    name: "Julia Japan",
    role: Role.CONFIRMED_ACTIVIST,
    chapters: ["Tokyo"],
    onboardingStatus: OnboardingStatus.CONFIRMED,
    stats: {
      totalHours: 65,
      cubesAttended: 8,
      veganConversions: 7,
      cities: ["Tokyo"],
    },
    hostingAvailability: true,
    hostingCapacity: 1,
    joinDate: new Date("2023-11-05"),
  },
  {
    id: "user_11",
    name: "Kevin LA",
    role: Role.CONFIRMED_ACTIVIST,
    chapters: ["Los Angeles"],
    onboardingStatus: OnboardingStatus.CONFIRMED,
    stats: {
      totalHours: 120,
      cubesAttended: 22,
      veganConversions: 15,
      cities: ["Los Angeles"],
    },
    hostingAvailability: false,
    joinDate: new Date("2023-03-22"),
  },
  {
    id: "user_12",
    name: "Liam Denied",
    role: Role.ACTIVIST,
    chapters: ["London"],
    onboardingStatus: OnboardingStatus.DENIED,
    stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
    hostingAvailability: false,
    joinDate: new Date("2024-02-18"),
  },
];

export const USERS: User[] = USERS_DATA.map((u) => ({
  ...u,
  profilePictureUrl: `https://i.pravatar.cc/150?u=${u.id}`,
  badges:
    u.stats.cubesAttended > 0
      ? [
        badges.firstCube,
        ...(u.stats.cubesAttended >= 10 ? [badges.tenCubes] : []),
        ...(u.stats.cities.length >= 3 ? [badges.globalTraveler] : []),
      ]
      : [],
}));

export const CUBE_EVENTS: CubeEvent[] = [
  {
    id: "event_1",
    city: "London",
    location: "Trafalgar Square",
    dateTime: new Date("2025-08-15T14:00:00Z"),
    organizer: USERS.find((u) => u.id === "user_1")!,
    participants: [
      { user: USERS.find((u) => u.id === "user_1")!, eventRole: EventRole.ORGANIZER },
      { user: USERS.find((u) => u.id === "user_3")!, eventRole: EventRole.VOLUNTEER },
      { user: USERS.find((u) => u.id === "user_6")!, eventRole: EventRole.OUTREACH },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: "event_2",
    city: "New York",
    location: "Union Square",
    dateTime: new Date("2025-08-16T18:00:00Z"),
    organizer: USERS.find((u) => u.id === "user_2")!,
    participants: [
      { user: USERS.find((u) => u.id === "user_2")!, eventRole: EventRole.ORGANIZER },
      { user: USERS.find((u) => u.id === "user_8")!, eventRole: EventRole.SECURITY },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: "event_3",
    city: "Berlin",
    location: "Alexanderplatz",
    dateTime: new Date("2025-07-20T12:00:00Z"),
    organizer: USERS.find((u) => u.id === "user_4")!,
    participants: [
      { user: USERS.find((u) => u.id === "user_4")!, eventRole: EventRole.ORGANIZER },
      { user: USERS.find((u) => u.id === "user_3")!, eventRole: EventRole.VOLUNTEER },
    ],
    status: EventStatus.FINISHED,
    report: {
      hours: 5,
      attendance: {
        [USERS.find((u) => u.id === "user_4")!.id]: "Attended",
        [USERS.find((u) => u.id === "user_3")!.id]: "Attended",
      },
    },
  },
  {
    id: "event_4",
    city: "Sydney",
    location: "Circular Quay",
    dateTime: new Date("2025-09-01T11:00:00Z"),
    organizer: USERS.find((u) => u.id === "user_3")!,
    participants: [
      { user: USERS.find((u) => u.id === "user_3")!, eventRole: EventRole.ORGANIZER },
    ],
    status: EventStatus.UPCOMING,
  },
  {
    id: "event_5",
    city: "London",
    location: "Piccadilly Circus",
    dateTime: new Date("2025-07-18T15:00:00Z"),
    organizer: USERS.find((u) => u.id === "user_1")!,
    participants: [
      { user: USERS.find((u) => u.id === "user_1")!, eventRole: EventRole.ORGANIZER },
      { user: USERS.find((u) => u.id === "user_6")!, eventRole: EventRole.OUTREACH },
    ],
    status: EventStatus.FINISHED,
    report: {
      hours: 4,
      attendance: {
        [USERS.find((u) => u.id === "user_1")!.id]: "Attended",
        [USERS.find((u) => u.id === "user_6")!.id]: "Attended",
      },
    },
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann_1",
    author: USERS.find((u) => u.id === "user_3")!,
    scope: AnnouncementScope.GLOBAL,
    title: "New Global Activist Training Protocol Released",
    content:
      "We've updated our official training documents. Please review the new materials in the Resources section before your next event.",
    createdAt: new Date("2025-07-25T10:00:00Z"),
  },
  {
    id: "ann_2",
    author: USERS.find((u) => u.id === "user_2")!,
    scope: AnnouncementScope.REGIONAL,
    country: "USA",
    title: "Coordination Call for USA Chapters - August",
    content:
      "We will be holding a coordination call for all USA-based chapter organizers on August 5th to plan for the upcoming national outreach day.",
    createdAt: new Date("2025-07-22T15:00:00Z"),
  },
  {
    id: "ann_3",
    author: USERS.find((u) => u.id === "user_1")!,
    scope: AnnouncementScope.CHAPTER,
    chapter: "London",
    title: "Volunteers Needed for Leaflet Distribution",
    content:
      "We need 5 volunteers for a special leaflet distribution event this Wednesday in Soho. Please RSVP in the event chat if you can make it.",
    createdAt: new Date("2025-07-28T09:00:00Z"),
  },
];

export const RESOURCES: Resource[] = [
  {
    id: "res_1",
    title: "Cube of Truth - Official Protocol",
    description: "The complete, unabridged guide to running a successful Cube of Truth.",
    type: ResourceType.DOCUMENT,
    skillLevel: SkillLevel.BEGINNER,
    language: "English",
    url: "#",
    icon: DocumentTextIcon,
  },
  {
    id: "res_2",
    title: "Effective Outreach Conversations",
    description: "A video guide on how to approach and engage with the public.",
    type: ResourceType.VIDEO,
    skillLevel: SkillLevel.INTERMEDIATE,
    language: "English",
    url: "#",
    icon: VideoCameraIcon,
  },
  {
    id: "res_3",
    title: "Handling Difficult Questions",
    description: "A guide for handling common objections and difficult conversations.",
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.ADVANCED,
    language: "English",
    url: "#",
    icon: BookOpenIcon,
  },
  {
    id: "res_4",
    title: "Event Security Best Practices",
    description: "How to maintain a safe and secure environment for activists and the public.",
    type: ResourceType.GUIDE,
    skillLevel: SkillLevel.INTERMEDIATE,
    language: "English",
    url: "#",
    icon: DocumentTextIcon,
  },
];

export const CHAPTERS: Chapter[] = chapters;

export const ACCOMMODATION_REQUESTS: AccommodationRequest[] = [
  {
    id: "req_1",
    requester: USERS.find((u) => u.id === "user_6")!,
    host: USERS.find((u) => u.id === "user_1")!,
    event: CUBE_EVENTS.find((e) => e.id === "event_1")!,
    startDate: new Date("2025-08-14"),
    endDate: new Date("2025-08-16"),
    message: "Hi Alex! I'm coming in from Paris for the Trafalgar Square event. Would be amazing if I could stay for a couple of nights. Thanks!",
    status: "Pending",
  },
];

export const OUTREACH_LOGS: OutreachLog[] = [
  {
    id: "log_1",
    userId: "user_1",
    eventId: "event_5",
    outcome: OutreachOutcome.BECAME_VEGAN,
    notes: "A young couple took a card and promised to watch Dominion together tonight. They seemed very receptive.",
    createdAt: new Date("2025-07-18T17:30:00Z"),
  },
  {
    id: "log_2",
    userId: "user_6",
    eventId: "event_5",
    outcome: OutreachOutcome.MOSTLY_SURE,
    notes: "Talked to a man who was already vegetarian. He said he would seriously consider cutting out dairy after our conversation.",
    createdAt: new Date("2025-07-18T18:00:00Z"),
  },
];

export const EVENT_COMMENTS: EventComment[] = [
  {
    id: "comment_1",
    eventId: "event_1",
    author: USERS.find((u) => u.id === "user_6")!,
    content: "Really excited for this one! Does anyone know the best tube station to get off at?",
    createdAt: new Date("2025-07-29T11:00:00Z"),
  },
  {
    id: "comment_2",
    eventId: "event_1",
    author: USERS.find((u) => u.id === "user_1")!,
    content: "Charing Cross is the closest, but Leicester Square is also just a short walk away. See you there!",
    createdAt: new Date("2025-07-29T11:05:00Z"),
    parentId: "comment_1",
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    type: NotificationType.NEW_ANNOUNCEMENT,
    message: 'A new global announcement was posted by Charlie Global.',
    linkTo: 'announcements',
    isRead: false,
    createdAt: new Date('2025-07-25T10:01:00Z'),
    relatedUser: USERS.find(u => u.id === 'user_3')
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    type: NotificationType.ACCOMMODATION_REQUEST,
    message: 'Fiona Verified requested accommodation for an event.',
    linkTo: 'dashboard',
    isRead: true,
    createdAt: new Date('2025-07-28T14:00:00Z'),
    relatedUser: USERS.find(u => u.id === 'user_6')
  },
];