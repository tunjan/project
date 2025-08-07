import { useDataStore } from '@/store/data.store';
import { useNotificationActions } from '@/store/notification.store';
import {
    type User, type OnboardingAnswers, Role, EventRole,
    type Chapter,
    OnboardingStatus
} from '@/types';
import { ROLE_HIERARCHY } from '@/utils/auth';

export const useDataActions = () => {
    const setState = useDataStore.setState;
    useNotificationActions();

    const register = (formData: { name: string; instagram: string; chapter: string; answers: OnboardingAnswers }) => {
        const newUser: User = { id: `user_${Date.now()}`, name: formData.name, instagram: formData.instagram || undefined, chapters: [formData.chapter], onboardingAnswers: formData.answers, role: Role.ACTIVIST, onboardingStatus: OnboardingStatus.PENDING, stats: { totalHours: 0, cubesAttended: 0, veganConversions: 0, cities: [] }, profilePictureUrl: `https://picsum.photos/seed/newuser${Date.now()}/100/100`, badges: [], hostingAvailability: false, };
        setState(state => ({ users: [...state.users, newUser] }));
    };

    const updateUserStatus = (userId: string, status: OnboardingStatus) => setState(state => ({ users: state.users.map(user => user.id === userId ? { ...user, onboardingStatus: status } : user) }));
    const createEvent = () => { /* implementation */ };
    const rsvp = (eventId: string, currentUser: User) => setState(state => ({ events: state.events.map(event => (event.id === eventId && !event.participants.some(p => p.user.id === currentUser.id)) ? { ...event, participants: [...event.participants, { user: currentUser, eventRole: EventRole.VOLUNTEER }] } : event) }));
    const cancelRsvp = (eventId: string, currentUser: User) => setState(state => ({ events: state.events.map(event => event.id === eventId ? { ...event, participants: event.participants.filter(p => p.user.id !== currentUser.id) } : event) }));
    const updateUserRole = (userId: string, role: Role) => setState(state => ({ users: state.users.map(user => { if (user.id !== userId) return user; const changes: Partial<User> = { role }; if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.CHAPTER_ORGANISER]) changes.organiserOf = []; if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[Role.REGIONAL_ORGANISER]) delete changes.managedCountry; return { ...user, ...changes }; }) }));
    const setChapterOrganiser = (userId: string, chaptersToOrganise: string[]) => setState(state => ({ users: state.users.map(user => user.id === userId ? { ...user, role: Role.CHAPTER_ORGANISER, organiserOf: [...new Set(chaptersToOrganise)] } : user) }));
    const updateUserChapters = (userId: string, newChapters: string[]) => setState(state => ({ users: state.users.map(user => user.id === userId ? { ...user, chapters: newChapters } : user) }));
    const logEventReport = () => { /* implementation */ };
    const issueIdentityToken = () => { /* implementation */ };
    const updateProfile = (userId: string, updatedData: { name: string; instagram: string; hostingAvailability: boolean; hostingCapacity: number; }) => setState(state => ({ users: state.users.map(user => user.id === userId ? { ...user, ...updatedData, instagram: updatedData.instagram || undefined } : user) }));
    const createAccommodationRequest = () => { /* implementation */ };
    const respondToAccommodationRequest = () => { /* implementation */ };
    const postComment = (eventId: string, content: string, author: User) => setState(state => ({ eventComments: [...state.eventComments, { id: `comment_${Date.now()}`, eventId, content, author, createdAt: new Date() }] }));
    const createAnnouncement = () => { /* implementation */ };
    const createChapter = (newChapterData: Chapter) => setState(state => ({ chapters: [...state.chapters, newChapterData] }));
    const deleteUser = (userIdToDelete: string) => setState(state => ({ users: state.users.filter(u => u.id !== userIdToDelete) }));
    const logOutreach = () => { /* implementation */ };

    return {
        register, updateUserStatus, createEvent, rsvp, cancelRsvp, updateUserRole, setChapterOrganiser,
        updateUserChapters, logEventReport, issueIdentityToken, updateProfile, createAccommodationRequest,
        respondToAccommodationRequest, postComment, createAnnouncement, createChapter, deleteUser, logOutreach
    };
};