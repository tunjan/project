import { Role, EventRole, EventStatus, type User, type CubeEvent, type Badge, OnboardingStatus, type Chapter, type Announcement, AnnouncementScope, type Resource, ResourceType, SkillLevel, type AccommodationRequest, OutreachOutcome, type OutreachLog, type EventComment, type Notification, NotificationType } from './types';
import { StarIcon, FireIcon, GlobeAltIcon, ShieldCheckIcon, DocumentTextIcon, VideoCameraIcon } from './components/icons';

export const CHAPTERS: Chapter[] = [
    { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
    { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo', country: 'Japan', lat: 35.6895, lng: 139.6917 },
    { name: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426 },
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

const assignBadges = (user: Omit<User, 'badges' | 'onboardingStatus' | 'onboardingAnswers' | 'profilePictureUrl' | 'report'> & {profilePictureUrl?: string}): Badge[] => {
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
    chapters: ['London'], // Regional organisers might not belong to a single chapter, but let's put them in one for notifications
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
  }
];

export const USERS: User[] = USERS_DATA.map((u, index) => ({ 
    ...u, 
    profilePictureUrl: `https://picsum.photos/seed/user${index+1}/100/100`,
    badges: assignBadges(u) 
}));

export const DELETED_USER: User = {
    id: 'user_deleted',
    name: 'Deleted User',
    role: Role.ACTIVIST,
    chapters: [],
    stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
    profilePictureUrl: 'https://avatar.vercel.sh/deleted',
    badges: [],
    hostingAvailability: false,
    onboardingStatus: 'Confirmed',
};

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
    }
];


const generateInitialNotifications = (users: User[], announcements: Announcement[], accommodationRequests: AccommodationRequest[]): Notification[] => {
    const notifications: Notification[] = [];

    const requestForAlex = accommodationRequests.find(req => req.host.id === 'user_1');
    if (requestForAlex) {
        notifications.push({
            id: 'notif_1',
            userId: 'user_1',
            type: NotificationType.ACCOMMODATION_REQUEST,
            message: `New hosting request from ${requestForAlex.requester.name} for the ${requestForAlex.event.location} event.`,
            linkTo: 'dashboard',
            isRead: false,
            createdAt: new Date(),
            relatedUser: requestForAlex.requester,
        });
    }

    const globalAnnouncement = announcements.find(a => a.scope === AnnouncementScope.GLOBAL)!;
    users.filter(u => u.id !== globalAnnouncement.author.id && u.onboardingStatus === 'Confirmed').slice(0, 2).forEach((user, index) => {
        notifications.push({
            id: `notif_${2 + index}`,
            userId: user.id,
            type: NotificationType.NEW_ANNOUNCEMENT,
            message: `Global announcement: "${globalAnnouncement.title}"`,
            linkTo: 'announcements',
            isRead: index % 2 === 0,
            createdAt: globalAnnouncement.createdAt,
            relatedUser: globalAnnouncement.author,
        })
    });
    
    const londonAnnouncement = announcements.find(a => a.chapter === 'London')!;
    if (londonAnnouncement) {
        notifications.push({
           id: 'notif_4',
           userId: 'user_3',
           type: NotificationType.NEW_ANNOUNCEMENT,
           message: `New in London: "${londonAnnouncement.title}"`,
           linkTo: 'announcements',
           isRead: true,
           createdAt: londonAnnouncement.createdAt,
           relatedUser: londonAnnouncement.author,
        });
    }

    return notifications.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const NOTIFICATIONS: Notification[] = generateInitialNotifications(USERS, ANNOUNCEMENTS, ACCOMMODATION_REQUESTS);