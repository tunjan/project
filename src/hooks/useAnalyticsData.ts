import { useState, useMemo, useEffect } from 'react';
import { Role } from '@/types';
import { useCurrentUser } from '@/store/auth.store';
import { useDataStore } from '@/store/data.store';
import { ROLE_HIERARCHY } from '@/utils/auth';
import {
    getGlobalStats,
    getChapterStats,
    getEventTrendsByMonth,
    getConversionRate,
    getActivistRetention,
    getMemberGrowth,
    getTopActivistsByHours,
    getAverageActivistsPerEvent
} from '@/utils/analytics';

export function useAnalyticsData() {
    const currentUser = useCurrentUser();
    const { users: allUsers, events: allEvents, chapters, outreachLogs } = useDataStore();

    const { availableCountries, chaptersForFilter, defaultCountry, defaultChapter } = useMemo(() => {
        if (!currentUser) return { availableCountries: [], chaptersForFilter: [], defaultCountry: '', defaultChapter: 'all' };

        const userLevel = ROLE_HIERARCHY[currentUser.role];

        if (userLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN]) {
            const countries = ['global', ...new Set(chapters.map(c => c.country))];
            return { availableCountries: countries, chaptersForFilter: chapters, defaultCountry: 'global', defaultChapter: 'all' };
        }

        if (currentUser.role === Role.REGIONAL_ORGANISER && currentUser.managedCountry) {
            const myCountry = currentUser.managedCountry;
            return { availableCountries: [myCountry], chaptersForFilter: chapters.filter(c => c.country === myCountry), defaultCountry: myCountry, defaultChapter: 'all' };
        }

        return { availableCountries: [], chaptersForFilter: [], defaultCountry: '', defaultChapter: 'all' };
    }, [currentUser, chapters]);

    const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
    const [selectedChapter, setSelectedChapter] = useState(defaultChapter);

    useEffect(() => {
        setSelectedCountry(defaultCountry);
        setSelectedChapter(defaultChapter);
    }, [defaultCountry, defaultChapter]);

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCountry(e.target.value);
        setSelectedChapter('all');
    };

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChapter(e.target.value);
    };

    const chaptersInSelectedCountry = useMemo(() => {
        if (selectedCountry === 'global') return chaptersForFilter;
        return chaptersForFilter.filter(c => c.country === selectedCountry);
    }, [selectedCountry, chaptersForFilter]);

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

    const { filteredUsers, filteredEvents, filteredChapters } = derivedData;

    const overviewStats = useMemo(() => getGlobalStats(filteredUsers, filteredEvents, filteredChapters), [filteredUsers, filteredEvents, filteredChapters]);
    const chapterStats = useMemo(() => getChapterStats(filteredUsers, filteredEvents, filteredChapters), [filteredUsers, filteredEvents, filteredChapters]);
    const eventTrends = useMemo(() => getEventTrendsByMonth(filteredEvents, 12), [filteredEvents]);
    const memberGrowth = useMemo(() => getMemberGrowth(allUsers, 12), [allUsers]);
    const conversionRate = useMemo(() => getConversionRate(overviewStats.totalConversions, overviewStats.totalHours), [overviewStats.totalConversions, overviewStats.totalHours]);
    const activistRetention = useMemo(() => getActivistRetention(filteredUsers, filteredEvents), [filteredUsers, filteredEvents]);
    const avgActivistsPerEvent = useMemo(() => getAverageActivistsPerEvent(filteredEvents), [filteredEvents]);
    const topActivists = useMemo(() => getTopActivistsByHours(filteredUsers, 5), [filteredUsers]);

    return {
        selectedCountry,
        selectedChapter,
        handleCountryChange,
        handleChapterChange,
        availableCountries,
        chaptersInSelectedCountry,
        viewTitle: derivedData.viewTitle,
        isChapterView: derivedData.isChapterView,
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