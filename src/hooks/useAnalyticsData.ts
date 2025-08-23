import { useState, useMemo, useEffect } from 'react';
import { Role } from '@/types';
import { useCurrentUser } from '@/store/auth.store';
import { useUsers, useEvents, useChapters, useOutreachLogs } from '@/store';
import { ROLE_HIERARCHY } from '@/utils/auth';
import {
    getGlobalStats,
    getChapterStats,
    getEventTrendsByMonth,
    getActivistRetention,
    getMemberGrowth,
    getTopActivistsByHours,
    getAverageActivistsPerEvent,
    getChapterOutreachStats, // NEW
    getConversationTrendsByMonth, // NEW
} from '@/utils/analytics';

export function useAnalyticsData() {
    const currentUser = useCurrentUser();
    const allUsers = useUsers();
    const allEvents = useEvents();
    const chapters = useChapters();
    const outreachLogs = useOutreachLogs();

    const { availableCountries, chaptersForFilter, defaultCountry, defaultChapter } =
        useMemo(() => {
            if (!currentUser) {
                return {
                    availableCountries: [],
                    chaptersForFilter: [],
                    defaultCountry: '',
                    defaultChapter: 'all',
                };
            }

            const userLevel = ROLE_HIERARCHY[currentUser.role];

            if (userLevel >= ROLE_HIERARCHY[Role.GLOBAL_ADMIN]) {
                const countries = [
                    'global',
                    ...new Set(chapters.map((c) => c.country)),
                ];
                return {
                    availableCountries: countries,
                    chaptersForFilter: chapters,
                    defaultCountry: 'global',
                    defaultChapter: 'all',
                };
            }

            if (
                currentUser.role === Role.REGIONAL_ORGANISER &&
                currentUser.managedCountry
            ) {
                const myCountry = currentUser.managedCountry;
                const countryChapters = chapters.filter((c) => c.country === myCountry);
                return {
                    availableCountries: [myCountry],
                    chaptersForFilter: countryChapters,
                    defaultCountry: myCountry,
                    defaultChapter: 'all',
                };
            }

            if (
                currentUser.role === Role.CHAPTER_ORGANISER &&
                currentUser.organiserOf &&
                currentUser.organiserOf.length > 0
            ) {
                const myChapters = chapters.filter((c) =>
                    currentUser.organiserOf!.includes(c.name)
                );

                return {
                    availableCountries: [],
                    chaptersForFilter: myChapters,
                    defaultCountry: '',
                    defaultChapter: myChapters[0]?.name || 'all',
                };
            }

            return {
                availableCountries: [],
                chaptersForFilter: [],
                defaultCountry: '',
                defaultChapter: 'all',
            };
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

        if (currentUser?.role === Role.CHAPTER_ORGANISER) return chaptersForFilter;
        return chaptersForFilter.filter((c) => c.country === selectedCountry);
    }, [selectedCountry, chaptersForFilter, currentUser?.role]);

    const derivedData = useMemo(() => {
        if (!currentUser)
            return {
                filteredUsers: [],
                filteredEvents: [],
                filteredChapters: [],
                filteredOutreachLogs: [],
                viewTitle: 'No Data',
                isChapterView: false,
            };

        let chaptersToAnalyze = chaptersForFilter;
        let viewTitle = 'Global Overview';
        let isChapterView = false;

        if (selectedChapter !== 'all') {
            const chap = chapters.find((c) => c.name === selectedChapter);
            chaptersToAnalyze = chap ? [chap] : [];
            viewTitle = chap ? `${chap.name} Chapter` : 'Chapter';
            isChapterView = true;
        } else if (selectedCountry !== 'global' && selectedCountry !== '') {
            chaptersToAnalyze = chapters.filter((c) => c.country === selectedCountry);
            viewTitle = `${selectedCountry} Region`;
        } else if (currentUser.role === Role.CHAPTER_ORGANISER) {
            viewTitle = 'My Chapters Overview';
            isChapterView = false;
        }

        const chapterNames = new Set(chaptersToAnalyze.map((c) => c.name));
        const filteredEvents = allEvents.filter((e) => chapterNames.has(e.city));
        const filteredUsers = allUsers.filter((u) =>
            u.chapters.some((c) => chapterNames.has(c))
        );
        const eventIds = new Set(filteredEvents.map((e) => e.id));
        const filteredOutreachLogs = outreachLogs.filter((log) =>
            eventIds.has(log.eventId)
        );

        return {
            filteredUsers,
            filteredEvents,
            filteredChapters: chaptersToAnalyze,
            filteredOutreachLogs,
            viewTitle,
            isChapterView,
        };
    }, [
        currentUser,
        selectedCountry,
        selectedChapter,
        allUsers,
        allEvents,
        chapters,
        outreachLogs,
        chaptersForFilter,
    ]);

    const { filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs } =
        derivedData;

    const overviewStats = useMemo(
        () => getGlobalStats(filteredUsers, filteredEvents, filteredChapters),
        [filteredUsers, filteredEvents, filteredChapters]
    );
    const chapterStats = useMemo(
        () => getChapterStats(filteredUsers, filteredEvents, filteredChapters),
        [filteredUsers, filteredEvents, filteredChapters]
    );
    const eventTrends = useMemo(
        () => getEventTrendsByMonth(filteredEvents, 12),
        [filteredEvents]
    );
    const memberGrowth = useMemo(() => getMemberGrowth(allUsers, 12), [allUsers]);

    // NEW: Calculate conversation trends
    const conversationTrends = useMemo(
        () => getConversationTrendsByMonth(filteredOutreachLogs, 12),
        [filteredOutreachLogs]
    );

    const activistRetention = useMemo(
        () => getActivistRetention(filteredUsers, filteredEvents),
        [filteredUsers, filteredEvents]
    );
    const avgActivistsPerEvent = useMemo(
        () => getAverageActivistsPerEvent(filteredEvents),
        [filteredEvents]
    );
    const topActivists = useMemo(
        () => getTopActivistsByHours(filteredUsers, 5),
        [filteredUsers]
    );
    // NEW: Calculate efficiency stats
    const chapterOutreachStats = useMemo(
        () =>
            getChapterOutreachStats(
                filteredUsers,
                filteredEvents,
                filteredChapters,
                filteredOutreachLogs
            ),
        [filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs]
    );

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
        conversationTrends, // NEW: Expose new data
        activistRetention,
        avgActivistsPerEvent,
        topActivists,
        chapterOutreachStats,
    };
}