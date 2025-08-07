import { useState, useMemo, useEffect } from 'react';
import { type User, type CubeEvent, type Chapter, Role, type OutreachLog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ROLE_HIERARCHY } from '../utils/auth';
import {
    getGlobalStats,
    getChapterStats,
    getEventTrendsByMonth,
    getConversionRate,
    getActivistRetention,
    getMemberGrowth,
    getTopActivistsByHours,
    getAverageActivistsPerEvent
} from '../utils/analytics';

export function useAnalyticsData() {
    const { currentUser } = useAuth();
    const { users: allUsers, events: allEvents, chapters, outreachLogs } = useData();

    // Step 1: Determine user's data scope and default filter state based on their role.
    const { availableCountries, chaptersForFilter, defaultCountry, defaultChapter } = useMemo(() => {
        if (!currentUser) return { availableCountries: [], chaptersForFilter: [], defaultCountry: '', defaultChapter: 'all' };

        const userLevel = ROLE_HIERARCHY[currentUser.role];

        if (userLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN]) {
            return {
                availableCountries: ['global', ...new Set(chapters.map(c => c.country))],
                chaptersForFilter: chapters,
                defaultCountry: 'global',
                defaultChapter: 'all'
            };
        }
        if (currentUser.role === Role.REGIONAL_ORGANISER && currentUser.managedCountry) {
            const myCountry = currentUser.managedCountry;
            return {
                availableCountries: [myCountry],
                chaptersForFilter: chapters.filter(c => c.country === myCountry),
                defaultCountry: myCountry,
                defaultChapter: 'all'
            };
        }
        if (currentUser.role === Role.CHAPTER_ORGANISER && currentUser.organiserOf) {
            const myChapters = chapters.filter(c => currentUser.organiserOf!.includes(c.name));
            const myCountries = [...new Set(myChapters.map(c => c.country))];
            return {
                availableCountries: myCountries,
                chaptersForFilter: myChapters,
                defaultCountry: myCountries[0] || '',
                defaultChapter: myChapters.length === 1 ? myChapters[0].name : 'all',
            };
        }
        return { availableCountries: [], chaptersForFilter: [], defaultCountry: '', defaultChapter: 'all' };
    }, [currentUser, chapters]);

    // Step 2: Manage filter state.
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
    const [selectedChapter, setSelectedChapter] = useState(defaultChapter);

    // Effect to reset filters if the user's default scope changes (e.g., role promotion).
    useEffect(() => {
        setSelectedCountry(defaultCountry);
        setSelectedChapter(defaultChapter);
    }, [defaultCountry, defaultChapter]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setSelectedChapter('all'); // Reset chapter when country changes.
    };

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChapter(e.target.value);
    };

    const chaptersInSelectedCountry = useMemo(() => {
        if (selectedCountry === 'global') return chaptersForFilter;
        return chaptersForFilter.filter(c => c.country === selectedCountry);
    }, [selectedCountry, chaptersForFilter]);

    // Step 3: Centralized, memoized data filtering cascade. This is the performance enhancement.
    const derivedData = useMemo(() => {
        if (!currentUser) return {
            filteredUsers: [], filteredEvents: [], filteredChapters: [], filteredOutreachLogs: [], viewTitle: 'No Data', isChapterView: false
        };

        let chaptersToAnalyze = chaptersForFilter;
        let viewTitle = 'Global Overview';
        let isChapterView = false;

        if (selectedChapter !== 'all') {
            const chap = chapters.find(c => c.name === selectedChapter);
            chaptersToAnalyze = chap ? [chap] : [];
            viewTitle = chap ? `${chap.name} Chapter` : 'Chapter';
            isChapterView = true;
        } else if (selectedCountry !== 'global') {
            chaptersToAnalyze = chapters.filter(c => c.country === selectedCountry);
            viewTitle = `${selectedCountry} Region`;
        }

        const chapterNames = new Set(chaptersToAnalyze.map(c => c.name));
        const filteredEvents = allEvents.filter(e => chapterNames.has(e.city));
        const filteredUsers = allUsers.filter(u => u.chapters.some(c => chapterNames.has(c)));
        const eventIds = new Set(filteredEvents.map(e => e.id));
        const filteredOutreachLogs = outreachLogs.filter(log => eventIds.has(log.eventId));

        return {
            filteredUsers,
            filteredEvents,
            filteredChapters: chaptersToAnalyze,
            filteredOutreachLogs,
            viewTitle,
            isChapterView,
        };
    }, [currentUser, selectedCountry, selectedChapter, allUsers, allEvents, chapters, outreachLogs, chaptersForFilter]);

    // Step 4: Calculate all metrics based on the filtered data.
    const { filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs } = derivedData;

    const overviewStats = useMemo(() => getGlobalStats(filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs), [filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs]);
    const chapterStats = useMemo(() => getChapterStats(filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs), [filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs]);
    const eventTrends = useMemo(() => getEventTrendsByMonth(filteredEvents, 12), [filteredEvents]);
    const memberGrowth = useMemo(() => getMemberGrowth(filteredUsers, 12), [filteredUsers]);
    const conversionRate = useMemo(() => getConversionRate(filteredOutreachLogs, overviewStats.totalHours), [filteredOutreachLogs, overviewStats.totalHours]);
    const activistRetention = useMemo(() => getActivistRetention(filteredUsers, filteredEvents), [filteredUsers, filteredEvents]);
    const avgActivistsPerEvent = useMemo(() => getAverageActivistsPerEvent(filteredEvents), [filteredEvents]);
    const topActivists = useMemo(() => getTopActivistsByHours(filteredUsers, 5), [filteredUsers]);

    // Step 5: Return all state, handlers, and derived data needed by the component.
    return {
        // Filter state and handlers
        selectedCountry,
        selectedChapter,
        handleCountryChange,
        handleChapterChange,
        availableCountries,
        chaptersInSelectedCountry,

        // View context
        viewTitle: derivedData.viewTitle,
        isChapterView: derivedData.isChapterView,

        // Calculated stats and chart data
        overviewStats,
        chapterStats,
        eventTrends,
        memberGrowth,
        conversionRate,
        activistRetention,
        avgActivistsPerEvent,
        topActivists
    };
}