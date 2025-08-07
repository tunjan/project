import React, { createContext, useState, useContext, useCallback } from 'react';
import { 
    type CubeEvent, type User, type OnboardingAnswers, Role, EventStatus, EventRole, type EventReport, 
    type Announcement, AnnouncementScope, type Resource, type SignedIdentityToken, type IdentityTokenPayload, 
    type Chapter, type AccommodationRequest, OnboardingStatus, OutreachOutcome, type OutreachLog, type EventComment, NotificationType
} from '../types';
import { 
    USERS, CUBE_EVENTS, ANNOUNCEMENTS, CHAPTERS, RESOURCES, DELETED_USER, 
    ACCOMMODATION_REQUESTS, OUTREACH_LOGS, EVENT_COMMENTS 
} from '../constants';
import { ROLE_HIERARCHY } from '../utils/auth';
import { generateKeyPair, signPayload } from '../utils/crypto';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

export interface DataContextType {
    users: User[];
    events: CubeEvent[];
    announcements: Announcement[];
    resources: Resource[];
    chapters: Chapter[];
    accommodationRequests: AccommodationRequest[];
    outreachLogs: OutreachLog[];
    eventComments: EventComment[];
    register: (formData: { name: string; instagram: string; chapter: string; answers: OnboardingAnswers }) => User;
    updateUserStatus: (userId: string, status: OnboardingStatus) => User | undefined;
    createEvent: (eventData: Omit<CubeEvent, 'id' | 'organizer' | 'participants' | 'status'>, organizer: User) => CubeEvent;
    rsvp: (eventId: string, currentUser: User) => CubeEvent | undefined;
    cancelRsvp: (eventId: string, currentUser: User) => CubeEvent | undefined;
    updateUserRole: (userId: string, role: Role) => User | undefined;
    updateUserChapters: (userId: string, newChapters: string[]) => User | undefined;
    setChapterOrganiser: (userId: string, chaptersToOrganise: string[]) => User | undefined;
    logEventReport: (eventId: string, report: EventReport) => CubeEvent | undefined;
    createAnnouncement: (data: { title: string; content: string; scope: AnnouncementScope; target?: string }, author: User) => void;
    issueIdentityToken: (userId: string) => User | undefined;
    createChapter: (newChapterData: Chapter) => void;
    deleteUser: (userIdToDelete: string, currentUser: User) => void;
    updateProfile: (userId: string, updatedData: { name: string; instagram: string; hostingAvailability: boolean; hostingCapacity: number; }) => User | undefined;
    createAccommodationRequest: (requestData: Omit<AccommodationRequest, 'id' | 'requester' | 'status'>, requester: User) => void;
    respondToAccommodationRequest: (requestId: string, response: 'Accepted' | 'Denied', host: User, replyMessage?: string) => void;
    logOutreach: (data: { eventId: string; outcome: OutreachOutcome; notes: string; }, currentUser: User) => void;
    postComment: (eventId: string, content: string, author: User) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { updateCurrentUser } = useAuth();
    const { addNotification, addNotifications } = useNotifications();

    const [users, setUsers] = useState<User[]>(USERS);
    const [events, setEvents] = useState<CubeEvent[]>(CUBE_EVENTS);
    const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
    const [resources] = useState<Resource[]>(RESOURCES);
    const [chapters, setChapters] = useState<Chapter[]>(CHAPTERS);
    const [accommodationRequests, setAccommodationRequests] = useState<AccommodationRequest[]>(ACCOMMODATION_REQUESTS);
    const [outreachLogs, setOutreachLogs] = useState<OutreachLog[]>(OUTREACH_LOGS);
    const [eventComments, setEventComments] = useState<EventComment[]>(EVENT_COMMENTS);
    
    const register = useCallback((formData: { name: string; instagram: string; chapter: string; answers: OnboardingAnswers }) => {
        let newUser: User | null = null;
        setUsers(prev => {
            newUser = {
                id: `user_${prev.length + 1}`,
                name: formData.name,
                instagram: formData.instagram || undefined,
                chapters: [formData.chapter],
                onboardingAnswers: formData.answers,
                role: Role.ACTIVIST,
                onboardingStatus: 'Pending',
                stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] },
                profilePictureUrl: `https://picsum.photos/seed/newuser${prev.length + 1}/100/100`,
                badges: [],
                hostingAvailability: false,
            };
            return [...prev, newUser];
        });
        return newUser!;
    }, [setUsers]);

    const updateUserStatus = useCallback((userId: string, status: OnboardingStatus) => {
        let updatedUser: User | undefined;
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                updatedUser = { ...user, onboardingStatus: status };
                return updatedUser;
            }
            return user;
        }));
        return updatedUser;
    }, [setUsers]);

    const createEvent = useCallback((eventData: Omit<CubeEvent, 'id' | 'organizer' | 'participants' | 'status'>, organizer: User) => {
        let newEvent: CubeEvent | null = null;
        setEvents(prev => {
             newEvent = {
                id: `event_${prev.length + 1}`,
                ...eventData,
                organizer,
                participants: [{ user: organizer, eventRole: EventRole.ORGANIZER }],
                status: EventStatus.UPCOMING,
            };
            return [newEvent, ...prev]
        });
        return newEvent!;
    }, [setEvents]);
    
    const rsvp = useCallback((eventId: string, currentUser: User) => {
        let updatedEvent: CubeEvent | undefined;
        setEvents(prev => prev.map(event => {
            if (event.id === eventId && !event.participants.some(p => p.user.id === currentUser.id)) {
                const newParticipant = { user: currentUser, eventRole: EventRole.VOLUNTEER };
                updatedEvent = { ...event, participants: [...event.participants, newParticipant] };
                return updatedEvent;
            }
            return event;
        }));
        return updatedEvent;
    }, [setEvents]);

    const cancelRsvp = useCallback((eventId: string, currentUser: User) => {
        let updatedEvent: CubeEvent | undefined;
        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                updatedEvent = { ...event, participants: event.participants.filter(p => p.user.id !== currentUser.id) };
                return updatedEvent;
            }
            return event;
        }));
        return updatedEvent;
    }, [setEvents]);

    const updateUserRole = useCallback((userId: string, role: Role) => {
        let updatedUser: User | undefined;
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                const changes = { ...user, role };
                if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.CHAPTER_ORGANISER]) delete changes.organiserOf;
                if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) delete changes.managedCountry;
                updatedUser = changes;
                return updatedUser;
            }
            return user;
        }));
        if (updatedUser) updateCurrentUser(updatedUser);
        return updatedUser;
    }, [setUsers, updateCurrentUser]);
    
    const updateUserChapters = useCallback((userId: string, newChapters: string[]) => {
        let updatedUser: User | undefined;
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                updatedUser = { ...user, chapters: newChapters };
                return updatedUser;
            }
            return user;
        }));
        if (updatedUser) updateCurrentUser(updatedUser);
        return updatedUser;
    }, [setUsers, updateCurrentUser]);

    const setChapterOrganiser = useCallback((userId: string, chaptersToOrganise: string[]) => {
        let updatedUser: User | undefined;
        const finalChapters = [...new Set(chaptersToOrganise)];
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                updatedUser = { ...user, role: Role.CHAPTER_ORGANISER, organiserOf: finalChapters };
                return updatedUser;
            }
            return user;
        }));
        if (updatedUser) updateCurrentUser(updatedUser);
        return updatedUser;
    }, [setUsers, updateCurrentUser]);

    const logEventReport = useCallback((eventId: string, report: EventReport) => {
        let updatedEvent: CubeEvent | undefined;
        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                updatedEvent = { ...event, status: EventStatus.FINISHED, report };
                return updatedEvent;
            }
            return event;
        }));

        setUsers(prev => prev.map(user => {
            if (report.attendance[user.id] === 'Attended') {
                const newStats = { ...user.stats, cubesAttended: user.stats.cubesAttended + 1, totalHours: user.stats.totalHours + report.hours };
                if (updatedEvent && !newStats.cities.includes(updatedEvent.city)) {
                    newStats.cities.push(updatedEvent.city);
                }
                const updatedUserWithStats = { ...user, stats: newStats };
                if(user.id === updatedEvent?.organizer.id) updateCurrentUser(updatedUserWithStats);
                return updatedUserWithStats;
            }
            return user;
        }));
        
        return updatedEvent;
    }, [setEvents, setUsers, updateCurrentUser]);

    const createAnnouncement = useCallback((data: { title: string; content: string; scope: AnnouncementScope; target?: string }, author: User) => {
        const newAnnouncement: Announcement = {
            id: `anno_${Date.now()}`, author, title: data.title, content: data.content, scope: data.scope, createdAt: new Date()
        };
        if (data.scope === AnnouncementScope.CHAPTER && data.target) newAnnouncement.chapter = data.target;
        if (data.scope === AnnouncementScope.REGIONAL && data.target) newAnnouncement.country = data.target;

        setAnnouncements(prev => [newAnnouncement, ...prev]);

        const usersToNotify = users.filter(u => {
            if (u.id === author.id) return false;
            if (newAnnouncement.scope === AnnouncementScope.GLOBAL) return true;
            if (newAnnouncement.scope === AnnouncementScope.REGIONAL) return chapters.find(c => c.name === u.chapters[0])?.country === newAnnouncement.country;
            if (newAnnouncement.scope === AnnouncementScope.CHAPTER) return u.chapters.includes(newAnnouncement.chapter || '');
            return false;
        });

        const newNotifications = usersToNotify.map(u => ({
            userId: u.id, type: NotificationType.NEW_ANNOUNCEMENT, message: `New ${newAnnouncement.scope} announcement: "${newAnnouncement.title}"`, linkTo: 'announcements' as const, relatedUser: author
        }));
        addNotifications(newNotifications);
    }, [users, chapters, addNotifications, setAnnouncements]);

    const issueIdentityToken = useCallback((userId: string) => {
        let userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) return undefined;
        
        const { publicKey, secretKey } = generateKeyPair();
        const payload: IdentityTokenPayload = {
            userId: userToUpdate.id, name: userToUpdate.name, role: Role.CONFIRMED_ACTIVIST, chapters: userToUpdate.chapters, issuedAt: new Date().toISOString()
        };
        const signature = signPayload(payload, secretKey);
        const token: SignedIdentityToken = { payload, signature, publicKey };

        const updatedUserFields = { identityToken: token, role: Role.CONFIRMED_ACTIVIST, onboardingStatus: 'Confirmed' as const };
        
        let updatedUser: User | undefined;
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                updatedUser = { ...user, ...updatedUserFields };
                return updatedUser;
            }
            return user;
        }));
        if(updatedUser) updateCurrentUser(updatedUser);
        return updatedUser;
    }, [users, setUsers, updateCurrentUser]);

    const createChapter = useCallback((newChapterData: Chapter) => {
        setChapters(prev => [...prev, newChapterData]);
    }, [setChapters]);

    const deleteUser = useCallback((userIdToDelete: string, currentUser: User) => {
        setEvents(prev => prev.map(e => {
            if(e.organizer.id === userIdToDelete) return { ...e, organizer: DELETED_USER };
            return { ...e, participants: e.participants.filter(p => p.user.id !== userIdToDelete) };
        }));
        setAnnouncements(prev => prev.map(a => a.author.id === userIdToDelete ? { ...a, author: DELETED_USER } : a));
        setEventComments(prev => prev.map(c => c.author.id === userIdToDelete ? {...c, author: DELETED_USER} : c));
        setUsers(prev => prev.filter(u => u.id !== userIdToDelete));
    }, [setEvents, setAnnouncements, setEventComments, setUsers]);

    const updateProfile = useCallback((userId: string, updatedData: { name: string; instagram: string; hostingAvailability: boolean; hostingCapacity: number; }) => {
        const finalData = { ...updatedData, instagram: updatedData.instagram || undefined };
        let updatedUser: User | undefined;
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                updatedUser = { ...user, ...finalData };
                return updatedUser;
            }
            return user;
        }));
        if (updatedUser) updateCurrentUser(updatedUser);
        return updatedUser;
    }, [setUsers, updateCurrentUser]);

    const createAccommodationRequest = useCallback((requestData: Omit<AccommodationRequest, 'id' | 'requester' | 'status'>, requester: User) => {
        setAccommodationRequests(prev => {
            const newRequest: AccommodationRequest = {
                id: `req_${prev.length + 1}`, requester, status: 'Pending', ...requestData,
            };
            return [...prev, newRequest];
        });
        
        addNotification({
            userId: requestData.host.id, type: NotificationType.ACCOMMODATION_REQUEST, message: `New hosting request from ${requester.name} for the ${requestData.event.location} event.`, linkTo: 'dashboard', relatedUser: requester,
        });
    }, [setAccommodationRequests, addNotification]);

    const respondToAccommodationRequest = useCallback((requestId: string, response: 'Accepted' | 'Denied', host: User, replyMessage?: string) => {
        let updatedRequest: AccommodationRequest | undefined;
        setAccommodationRequests(prev => prev.map(req => {
            if (req.id === requestId) {
                updatedRequest = { ...req, status: response, hostReply: replyMessage };
                return updatedRequest;
            }
            return req;
        }));
      
        if(updatedRequest){
            addNotification({
                userId: updatedRequest.requester.id, type: response === 'Accepted' ? NotificationType.REQUEST_ACCEPTED : NotificationType.REQUEST_DENIED, message: `${host.name} ${response.toLowerCase()} your accommodation request for ${updatedRequest.event.location}.`, linkTo: 'dashboard', relatedUser: host,
            });
        }
    }, [setAccommodationRequests, addNotification]);

    const logOutreach = useCallback((data: { eventId: string; outcome: OutreachOutcome; notes: string; }, currentUser: User) => {
        setOutreachLogs(prev => {
            const newLog: OutreachLog = {
                id: `outreach_${prev.length + 1}`, userId: currentUser.id, ...data, createdAt: new Date()
            };
            return [newLog, ...prev];
        });

        if ([OutreachOutcome.BECAME_VEGAN, OutreachOutcome.BECAME_VEGAN_ACTIVIST].includes(data.outcome)) {
            let updatedUser: User | undefined;
            setUsers(prev => prev.map(user => {
                if (user.id === currentUser.id) {
                    updatedUser = { ...user, stats: { ...user.stats, veganConversions: user.stats.veganConversions + 1 }};
                    return updatedUser;
                }
                return user;
            }));
            if(updatedUser) updateCurrentUser(updatedUser);
        }
    }, [setOutreachLogs, setUsers, updateCurrentUser]);
    
    const postComment = useCallback((eventId: string, content: string, author: User) => {
        setEventComments(prev => {
            const newComment: EventComment = {
                id: `comment_${prev.length + 1}`, eventId, content, author, createdAt: new Date(),
            };
            return [...prev, newComment]
        });
    }, [setEventComments]);

    const value = {
        users, events, announcements, resources, chapters, accommodationRequests, outreachLogs, eventComments,
        register, updateUserStatus, createEvent, rsvp, cancelRsvp, updateUserRole, updateUserChapters, setChapterOrganiser,
        logEventReport, createAnnouncement, issueIdentityToken, createChapter, deleteUser, updateProfile,
        createAccommodationRequest, respondToAccommodationRequest, logOutreach, postComment
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};