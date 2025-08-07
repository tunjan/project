import { create } from 'zustand';
import {
    CubeEvent, User, Resource, Announcement, Chapter, AccommodationRequest,
    OutreachLog, EventComment, Role, EventStatus, EventRole, OnboardingStatus, EventReport,
    AnnouncementScope, SignedIdentityToken, IdentityTokenPayload, NotificationType, OutreachOutcome, OnboardingAnswers
} from '@/types';
import {
    USERS, CUBE_EVENTS, ANNOUNCEMENTS, CHAPTERS, RESOURCES, ACCOMMODATION_REQUESTS, OUTREACH_LOGS, EVENT_COMMENTS
} from '@/constants';
import { ROLE_HIERARCHY } from '@/utils/auth';
import { generateKeyPair, signPayload } from '@/utils/crypto';
import { useNotificationStore } from '@/store/notification.store';
import { useAuthStore } from '@/store/auth.store'; // Import the auth store

interface DataState {
    users: User[];
    events: CubeEvent[];
    announcements: Announcement[];
    resources: Resource[];
    chapters: Chapter[];
    accommodationRequests: AccommodationRequest[];
    outreachLogs: OutreachLog[];
    eventComments: EventComment[];
    // --- Actions ---
    register: (formData: { name: string; instagram: string; chapter: string; answers: OnboardingAnswers }) => void;
    updateUserStatus: (userId: string, status: OnboardingStatus, approver?: User) => void;
    createEvent: (eventData: Omit<CubeEvent, 'id' | 'organizer' | 'participants' | 'status' | 'report'>, organizer: User) => void;
    rsvp: (eventId: string, currentUser: User) => void;
    cancelRsvp: (eventId: string, currentUser: User) => void;
    updateUserRole: (userId: string, role: Role) => void;
    setChapterOrganiser: (userId: string, chaptersToOrganise: string[]) => void;
    updateUserChapters: (userId: string, newChapters: string[]) => void;
    logEventReport: (eventId: string, report: EventReport) => void;
    issueIdentityToken: (userId: string) => void;
    updateProfile: (userId: string, updatedData: Partial<Pick<User, 'name' | 'instagram' | 'hostingAvailability' | 'hostingCapacity'>>) => void;
    createAccommodationRequest: (requestData: Omit<AccommodationRequest, 'id' | 'requester' | 'status'>, requester: User) => void;
    respondToAccommodationRequest: (requestId: string, response: 'Accepted' | 'Denied', host: User, replyMessage?: string) => void;
    postComment: (eventId: string, content: string, author: User) => void;
    createAnnouncement: (data: { title: string; content: string; scope: AnnouncementScope; target?: string }, author: User) => void;
    createChapter: (newChapterData: Chapter) => void;
    deleteUser: (userIdToDelete: string) => void;
    logOutreach: (data: { eventId: string; outcome: OutreachOutcome; notes?: string; }, currentUser: User) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
    users: USERS,
    events: CUBE_EVENTS,
    announcements: ANNOUNCEMENTS,
    resources: RESOURCES,
    chapters: CHAPTERS,
    accommodationRequests: ACCOMMODATION_REQUESTS,
    outreachLogs: OUTREACH_LOGS,
    eventComments: EVENT_COMMENTS,

    register: (formData) => {
        const newUser: User = { id: `user_${Date.now()}`, name: formData.name, instagram: formData.instagram || undefined, chapters: [formData.chapter], onboardingAnswers: formData.answers, role: Role.ACTIVIST, onboardingStatus: OnboardingStatus.PENDING, stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] }, profilePictureUrl: `https://i.pravatar.cc/100?u=${Date.now()}`, badges: [], hostingAvailability: false, joinDate: new Date() };
        set(state => ({ users: [...state.users, newUser] }));
    },

    updateUserStatus: (userId, status, approver) => {
        set(state => ({ users: state.users.map(user => user.id === userId ? { ...user, onboardingStatus: status } : user) }));
        if (status === OnboardingStatus.AWAITING_VERIFICATION) {
            const user = get().users.find(u => u.id === userId);
            if (user && approver) {
                useNotificationStore.getState().addNotification({
                    userId: user.id,
                    type: NotificationType.REQUEST_ACCEPTED,
                    message: `Your application for ${user.chapters[0]} was approved by ${approver.name}! Meet an organizer to get verified.`,
                    linkTo: 'dashboard'
                });
            }
        }
    },

    createEvent: (eventData, organizer) => {
        const newEvent: CubeEvent = { id: `event_${Date.now()}`, ...eventData, organizer, participants: [{ user: organizer, eventRole: EventRole.ORGANIZER }], status: EventStatus.UPCOMING };
        set(state => ({ events: [newEvent, ...state.events] }));
    },

    rsvp: (eventId, currentUser) => set(state => ({ events: state.events.map(event => (event.id === eventId && !event.participants.some(p => p.user.id === currentUser.id)) ? { ...event, participants: [...event.participants, { user: currentUser, eventRole: EventRole.VOLUNTEER }] } : event) })),

    cancelRsvp: (eventId, currentUser) => set(state => ({ events: state.events.map(event => event.id === eventId ? { ...event, participants: event.participants.filter(p => p.user.id !== currentUser.id) } : event) })),

    updateUserRole: (userId, role) => set(state => ({ users: state.users.map(user => { if (user.id !== userId) return user; const changes: Partial<User> = { role }; if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.CHAPTER_ORGANISER]) changes.organiserOf = []; if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) delete changes.managedCountry; return { ...user, ...changes }; }) })),

    setChapterOrganiser: (userId, chaptersToOrganise) => set(state => ({ users: state.users.map(user => user.id === userId ? { ...user, role: Role.CHAPTER_ORGANISER, organiserOf: [...new Set(chaptersToOrganise)] } : user) })),

    updateUserChapters: (userId, newChapters) => set(state => ({ users: state.users.map(user => user.id === userId ? { ...user, chapters: newChapters } : user) })),

    logEventReport: (eventId, report) => {
        set(state => {
            const event = state.events.find(e => e.id === eventId);
            if (!event) return state;

            const updatedEvents = state.events.map(e => e.id === eventId ? { ...e, report, status: EventStatus.FINISHED } : e);
            const updatedUsers = state.users.map(user => {
                if (report.attendance[user.id] === 'Attended') {
                    const newCities = [...new Set([...user.stats.cities, event.city])];
                    return {
                        ...user,
                        stats: {
                            ...user.stats,
                            totalHours: user.stats.totalHours + report.hours,
                            cubesAttended: user.stats.cubesAttended + 1,
                            cities: newCities
                        }
                    };
                }
                return user;
            });
            return { events: updatedEvents, users: updatedUsers };
        });
    },

    issueIdentityToken: (userId) => {
        set(state => ({
            users: state.users.map(user => {
                if (user.id !== userId) return user;
                const { publicKey, secretKey } = generateKeyPair();
                const newRole = ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[Role.CONFIRMED_ACTIVIST] ? Role.CONFIRMED_ACTIVIST : user.role;
                const payload: IdentityTokenPayload = { userId: user.id, name: user.name, role: newRole, chapters: user.chapters, issuedAt: new Date().toISOString() };
                const signature = signPayload(payload, secretKey);
                const identityToken: SignedIdentityToken = { payload, signature, publicKey };
                return { ...user, identityToken, onboardingStatus: OnboardingStatus.CONFIRMED, role: newRole };
            })
        }));
    },

    updateProfile: (userId, updatedData) => {
        const fullUpdate = { ...updatedData, instagram: updatedData.instagram || undefined };

        set(state => ({
            users: state.users.map(user =>
                user.id === userId ? { ...user, ...fullUpdate } : user
            )
        }));

        useAuthStore.getState().updateCurrentUser(fullUpdate);
    },

    createAccommodationRequest: (requestData, requester) => {
        const newRequest: AccommodationRequest = { id: `req_${Date.now()}`, requester, status: 'Pending', ...requestData };
        set(state => ({ accommodationRequests: [newRequest, ...state.accommodationRequests] }));
        useNotificationStore.getState().addNotification({
            userId: requestData.host.id, type: NotificationType.ACCOMMODATION_REQUEST, message: `${requester.name} requested accommodation for the ${requestData.event.location} event.`, linkTo: 'dashboard', relatedUser: requester
        });
    },

    respondToAccommodationRequest: (requestId, response, host, replyMessage) => {
        set(state => ({ accommodationRequests: state.accommodationRequests.map(req => req.id === requestId ? { ...req, status: response, hostReply: replyMessage } : req) }));
        const request = get().accommodationRequests.find(r => r.id === requestId);
        if (request) {
            const notifType = response === 'Accepted' ? NotificationType.REQUEST_ACCEPTED : NotificationType.REQUEST_DENIED;
            useNotificationStore.getState().addNotification({
                userId: request.requester.id, type: notifType, message: `${host.name} ${response.toLowerCase()} your accommodation request for ${request.event.location}.`, linkTo: 'dashboard', relatedUser: host
            });
        }
    },

    postComment: (eventId, content, author) => {
        const newComment: EventComment = { id: `comment_${Date.now()}`, eventId, content, author, createdAt: new Date() };
        set(state => ({ eventComments: [...state.eventComments, newComment] }));
    },

    createAnnouncement: (data, author) => {
        const newAnnouncement: Announcement = { id: `ann_${Date.now()}`, createdAt: new Date(), author, ...data };
        set(state => ({ announcements: [newAnnouncement, ...state.announcements] }));
    },

    createChapter: (newChapterData) => set(state => ({ chapters: [...state.chapters, newChapterData] })),

    deleteUser: (userIdToDelete) => {
        set(state => ({
            users: state.users.filter(u => u.id !== userIdToDelete),
            outreachLogs: state.outreachLogs.filter(l => l.userId !== userIdToDelete),
            accommodationRequests: state.accommodationRequests.filter(r => r.requester.id !== userIdToDelete && r.host.id !== userIdToDelete),
        }));
    },

    logOutreach: (data, currentUser) => {
        const newLog: OutreachLog = { id: `log_${Date.now()}`, userId: currentUser.id, createdAt: new Date(), ...data };
        set(state => ({
            outreachLogs: [...state.outreachLogs, newLog],
            users: state.users.map(user => {
                if (user.id === currentUser.id && (data.outcome === OutreachOutcome.BECAME_VEGAN || data.outcome === OutreachOutcome.BECAME_VEGAN_ACTIVIST)) {
                    return { ...user, stats: { ...user.stats, veganConversions: user.stats.veganConversions + 1 } };
                }
                return user;
            })
        }));
    },
}));

// --- Granular Hooks ---
// Create hooks for each slice of state to prevent unnecessary re-renders.
export const useUsers = () => useDataStore(state => state.users);
export const useEvents = () => useDataStore(state => state.events);
export const useChapters = () => useDataStore(state => state.chapters);
export const useAnnouncements = () => useDataStore(state => state.announcements);
export const useResources = () => useDataStore(state => state.resources);
export const useOutreachLogs = () => useDataStore(state => state.outreachLogs);
export const useEventComments = () => useDataStore(state => state.eventComments);

// Create hooks for specific data shapes to optimize further.
export const useEventById = (eventId: string | undefined) => useDataStore(state => state.events.find(e => e.id === eventId));
export const useChapterByName = (chapterName?: string) => useDataStore(state => chapterName ? state.chapters.find(c => c.name.toLowerCase() === chapterName.toLowerCase()) : undefined);
export const useUserById = (userId: string | undefined) => useDataStore(state => state.users.find(u => u.id === userId));

// A single hook to grab all actions.
export const useDataActions = () => useDataStore(state => ({
    register: state.register,
    updateUserStatus: state.updateUserStatus,
    createEvent: state.createEvent,
    rsvp: state.rsvp,
    cancelRsvp: state.cancelRsvp,
    updateUserRole: state.updateUserRole,
    setChapterOrganiser: state.setChapterOrganiser,
    updateUserChapters: state.updateUserChapters,
    logEventReport: state.logEventReport,
    issueIdentityToken: state.issueIdentityToken,
    updateProfile: state.updateProfile,
    createAccommodationRequest: state.createAccommodationRequest,
    respondToAccommodationRequest: state.respondToAccommodationRequest,
    postComment: state.postComment,
    createAnnouncement: state.createAnnouncement,
    createChapter: state.createChapter,
    deleteUser: state.deleteUser,
    logOutreach: state.logOutreach
}));