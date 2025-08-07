import React, { useState, useMemo, useEffect } from 'react';
import { type User, type CubeEvent, type Chapter, Role, type OutreachLog } from '../../types';
import { 
    getGlobalStats, 
    getChapterStats, 
    getEventTrendsByMonth,
    getConversionRate,
    getActivistRetention,
    getMemberGrowth,
    getTopActivistsByHours,
    getAverageActivistsPerEvent
} from '../../utils/analytics';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { ClockIcon, UsersIcon, TrendingUpIcon, GlobeAltIcon, SparklesIcon, UserGroupIcon } from '../icons';
import { ROLE_HIERARCHY } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Challenges from '../challenges/Challenges';


interface AnalyticsDashboardProps {}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; tooltip?: string }> = ({ icon, title, value, tooltip }) => (
    <div className="bg-white border border-black p-4 relative group">
        <div className="flex items-center">
            <div className="text-[#d81313]">{icon}</div>
            <p className="ml-3 text-sm font-semibold uppercase tracking-wider text-neutral-600">{title}</p>
        </div>
        <p className="mt-2 text-4xl font-extrabold text-black">{value}</p>
        {tooltip && (
            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {tooltip}
            </div>
        )}
    </div>
);

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
    const { currentUser } = useAuth();
    const { users: allUsers, events: allEvents, chapters, outreachLogs } = useData();

    if (!currentUser) return null;

    const { availableCountries, chaptersForFilter, defaultCountry, defaultChapter } = useMemo(() => {
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
            const myChapters = chapters.filter(c => c.country === myCountry);
            return {
                availableCountries: [myCountry],
                chaptersForFilter: myChapters,
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
                defaultCountry: myCountries.length > 0 ? myCountries[0] : 'global',
                defaultChapter: myChapters.length === 1 ? myChapters[0].name : 'all',
            };
        }
        return { availableCountries: [], chaptersForFilter: [], defaultCountry: 'global', defaultChapter: 'all' };
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
        if (selectedCountry === 'global') {
            return chaptersForFilter;
        }
        return chaptersForFilter.filter(c => c.country === selectedCountry);
    }, [selectedCountry, chaptersForFilter]);

    const {
        filteredUsers,
        filteredEvents,
        filteredChapters,
        filteredOutreachLogs,
        viewTitle,
        isChapterView
    } = useMemo(() => {
        let chaptersToAnalyze = chaptersForFilter;
        let title = 'Global Overview';
        let viewIsChapter = false;

        if (selectedChapter !== 'all') {
            const chap = chapters.find(c => c.name === selectedChapter);
            if (chap) {
                chaptersToAnalyze = [chap];
                title = `${chap.name} Chapter`;
                viewIsChapter = true;
            }
        } else if (selectedCountry !== 'global') {
            chaptersToAnalyze = chapters.filter(c => c.country === selectedCountry);
            title = `${selectedCountry} Region`;
        }

        const chapterNames = chaptersToAnalyze.map(c => c.name);
        const eventsToAnalyze = allEvents.filter(e => chapterNames.includes(e.city));
        const usersToAnalyze = allUsers.filter(u => u.chapters.some(c => chapterNames.includes(c)));
        const eventIds = new Set(eventsToAnalyze.map(e => e.id));
        const outreachLogsToAnalyze = outreachLogs.filter(log => eventIds.has(log.eventId));
        
        return {
            filteredUsers: usersToAnalyze,
            filteredEvents: eventsToAnalyze,
            filteredChapters: chaptersToAnalyze,
            filteredOutreachLogs: outreachLogsToAnalyze,
            viewTitle: title,
            isChapterView: viewIsChapter,
        };
    }, [selectedCountry, selectedChapter, allUsers, allEvents, chapters, outreachLogs, chaptersForFilter]);

    const overviewStats = useMemo(() => getGlobalStats(filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs), [filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs]);
    const chapterStats = useMemo(() => getChapterStats(filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs), [filteredUsers, filteredEvents, filteredChapters, filteredOutreachLogs]);
    const eventTrends = useMemo(() => getEventTrendsByMonth(filteredEvents, 12), [filteredEvents]);
    const memberGrowth = useMemo(() => getMemberGrowth(filteredUsers, 12), [filteredUsers]);
    
    const conversionRate = useMemo(() => getConversionRate(filteredOutreachLogs, overviewStats.totalHours), [filteredOutreachLogs, overviewStats.totalHours]);
    const activistRetention = useMemo(() => getActivistRetention(filteredUsers, filteredEvents), [filteredUsers, filteredEvents]);
    const avgActivistsPerEvent = useMemo(() => getAverageActivistsPerEvent(filteredEvents), [filteredEvents]);
    const topActivists = useMemo(() => getTopActivistsByHours(filteredUsers, 5), [filteredUsers]);

    const topChaptersByHours = useMemo(() =>
        [...chapterStats]
            .sort((a, b) => b.totalHours - a.totalHours)
            .slice(0, 5)
            .map(c => ({ label: c.name, value: c.totalHours }))
    , [chapterStats]);

    const topChaptersByMembers = useMemo(() =>
        [...chapterStats]
            .sort((a, b) => b.memberCount - a.memberCount)
            .slice(0, 5)
            .map(c => ({ label: c.name, value: c.memberCount }))
    , [chapterStats]);

    return (
        <div className="py-8 md:py-12">
            <div className="mb-8 md:mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">Analytics: {viewTitle}</h1>
                <p className="mt-3 max-w-2xl text-lg text-neutral-600">
                    Organization performance metrics and impact tracking. Use the filters to drill down.
                </p>
            </div>
            
            {/* Filters */}
            <div className="bg-white border border-black p-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="country-filter" className="block text-sm font-bold text-black mb-1">View</label>
                         <select
                            id="country-filter"
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            disabled={availableCountries.length <= 1}
                            className="w-full border border-black bg-white p-2 text-black focus:ring-0 sm:text-sm disabled:bg-neutral-200"
                        >
                            {availableCountries.map(country => (
                                <option key={country} value={country}>
                                    {country === 'global' ? 'Global' : `${country} Region`}
                                </option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="chapter-filter" className="block text-sm font-bold text-black mb-1">Chapter</label>
                        <select
                            id="chapter-filter"
                            value={selectedChapter}
                            onChange={handleChapterChange}
                            disabled={chaptersInSelectedCountry.length === 0}
                            className="w-full border border-black bg-white p-2 text-black focus:ring-0 sm:text-sm disabled:bg-neutral-200"
                        >
                            <option value="all">All Chapters</option>
                            {chaptersInSelectedCountry.map(chapter => (
                                <option key={chapter.name} value={chapter.name}>{chapter.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Global Stats */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<UsersIcon className="w-6 h-6" />} title="Total Members" value={overviewStats.totalMembers} />
                    <StatCard icon={<ClockIcon className="w-6 h-6" />} title="Total Hours" value={overviewStats.totalHours.toLocaleString()} />
                    <StatCard icon={<TrendingUpIcon className="w-6 h-6" />} title="Total Conversions" value={overviewStats.totalConversions.toLocaleString()} />
                    <StatCard icon={<GlobeAltIcon className="w-6 h-6" />} title="Total Events" value={overviewStats.totalEvents.toLocaleString()} />
                </div>
            </section>

            {/* Advanced Analytics */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-black border-b-2 border-[#d81313] pb-2 mb-4">Key Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                        icon={<SparklesIcon className="w-6 h-6" />} 
                        title="Conversion Rate" 
                        value={`${conversionRate.toFixed(2)}/hr`}
                        tooltip="Vegans converted per hour of outreach"
                    />
                    <StatCard 
                        icon={<UsersIcon className="w-6 h-6" />} 
                        title="Activist Retention" 
                        value={`${(activistRetention.rate * 100).toFixed(0)}%`}
                        tooltip="Members active in the last 3 months"
                    />
                    <StatCard 
                        icon={<UserGroupIcon className="w-6 h-6" />} 
                        title="Avg. Activists/Event" 
                        value={avgActivistsPerEvent.toFixed(1)}
                        tooltip="Average number of activists per event"
                    />
                </div>
            </section>
            
            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LineChart data={eventTrends.map(t => ({label: t.month.split(' ')[0], value: t.count}))} title="Events per Month" />
                <LineChart data={memberGrowth.map(t => ({label: t.month.split(' ')[0], value: t.count}))} title="New Members per Month" lineColor="#000000" />
                
                {!isChapterView && (
                    <>
                        <BarChart data={topChaptersByHours} title="Top 5 Chapters by Activist Hours" />
                        <BarChart data={topChaptersByMembers} title="Top 5 Chapters by Member Count" barColor="#000000" />
                    </>
                )}

                 {isChapterView && (
                    <BarChart data={topActivists.map(a => ({label: a.name, value: a.value}))} title="Top 5 Activists by Hours" />
                )}
            </section>

            <Challenges />
        </div>
    );
};

export default AnalyticsDashboard;
