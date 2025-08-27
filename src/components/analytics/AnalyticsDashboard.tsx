import React, { useMemo } from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import BarChart from './BarChart';
import LineChart from './LineChart';
import ScatterPlot from './ScatterPlot';
import ChapterScorecard from './ChapterScorecard';
import {
  ClockIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  UserGroupIcon,
} from '@/icons';
import Challenges from '@/components/challenges/Challenges';

interface AnalyticsDashboardProps {}

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  tooltip?: string;
}> = ({ icon, title, value, tooltip }) => (
  <div className="group relative border-2 border-black bg-white p-4">
    <div className="flex items-center">
      <div className="text-primary">{icon}</div>
      <p className="text-grey-600 ml-3 text-sm font-semibold uppercase tracking-wider">
        {title}
      </p>
    </div>
    <p className="mt-2 text-4xl font-extrabold text-black">{value}</p>
    {tooltip && (
      <div className="absolute bottom-full z-10 mb-2 w-max rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {tooltip}
      </div>
    )}
  </div>
);

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
  const {
    selectedCountry,
    selectedChapter,
    handleCountryChange,
    handleChapterChange,
    availableCountries,
    chaptersInSelectedCountry,
    viewTitle,
    isChapterView,
    overviewStats,
    chapterStats,
    eventTrends,
    memberGrowth,
    totalMembersByMonth,
    conversationTrends,
    activistRetention,
    avgActivistsPerEvent,
    topActivists,
    chapterOutreachStats,
  } = useAnalyticsData();

  const topChaptersByHours = useMemo(
    () =>
      [...chapterStats]
        .sort((a, b) => b.totalHours - a.totalHours)
        .slice(0, 5)
        .map((c) => ({ label: c.name, value: c.totalHours })),
    [chapterStats]
  );

  if (!overviewStats) return null;

  return (
    <div className="py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          Analytics: {viewTitle}
        </h1>
        <p className="text-grey-600 mt-3 max-w-2xl text-lg">
          Organization performance metrics and impact tracking. Use the filters
          to drill down.
        </p>
      </div>

      {/* Filters */}
      <div className="card-brutal mb-12 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="country-filter"
              className="mb-1 block text-sm font-bold text-black"
            >
              View
            </label>
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={handleCountryChange}
              disabled={availableCountries.length <= 1}
              className="w-full rounded-none border border-black bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-white sm:text-sm"
            >
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {country === 'global' ? 'Global' : `${country} Region`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="chapter-filter"
              className="mb-1 block text-sm font-bold text-black"
            >
              Chapter
            </label>
            <select
              id="chapter-filter"
              value={selectedChapter}
              onChange={handleChapterChange}
              disabled={chaptersInSelectedCountry.length === 0}
              className="w-full rounded-none border border-black bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-white sm:text-sm"
            >
              <option value="all">All Chapters</option>
              {chaptersInSelectedCountry.map((chapter) => (
                <option key={chapter.name} value={chapter.name}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!isChapterView && <ChapterScorecard />}

      {/* Overview */}
      <section className="my-16">
        <h2 className="mb-6 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <StatCard
            icon={<UsersIcon className="h-6 w-6" />}
            title="Total Members"
            value={overviewStats.totalMembers.toLocaleString()}
          />
          <StatCard
            icon={<ClockIcon className="h-6 w-6" />}
            title="Total Hours"
            value={overviewStats.totalHours.toLocaleString()}
          />
          <StatCard
            icon={<ChatBubbleLeftRightIcon className="h-6 w-6" />}
            title="Total Conversations"
            value={overviewStats.totalConversations.toLocaleString()}
          />
          <StatCard
            icon={<GlobeAltIcon className="h-6 w-6" />}
            title="Total Events"
            value={overviewStats.totalEvents.toLocaleString()}
          />
        </div>
      </section>

      {/* Key Metrics */}
      <section className="mb-16">
        <h2 className="mb-6 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StatCard
            icon={<UsersIcon className="h-6 w-6" />}
            title="Activist Retention"
            value={`${(activistRetention.rate * 100).toFixed(0)}%`}
            tooltip="Members active in the last 3 months"
          />
          <StatCard
            icon={<UserGroupIcon className="h-6 w-6" />}
            title="Avg. Activists/Event"
            value={avgActivistsPerEvent.toFixed(1)}
            tooltip="Average number of activists per event"
          />
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="card">
          <div className="card-content">
            <LineChart
              data={eventTrends.map((t) => ({
                label: t.month.split(' ')[0],
                value: t.count,
              }))}
              title="Events per Month"
            />
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <LineChart
              title="New Members per Month"
              data={memberGrowth.map((t) => ({
                label: t.month.split(' ')[0],
                value: t.count,
              }))}
            />
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <LineChart
              title="Total Members per Month"
              data={totalMembersByMonth.map((t) => ({
                label: t.month.split(' ')[0],
                value: t.count,
              }))}
            />
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <LineChart
              data={conversationTrends.map((t) => ({
                label: t.month.split(' ')[0],
                value: t.count,
              }))}
              title="Conversations per Month"
              lineColor="#6b7280"
            />
          </div>
        </div>

        {!isChapterView && (
          <>
            <div className="card">
              <div className="card-content">
                <BarChart
                  data={topChaptersByHours}
                  title="Top 5 Chapters by Activist Hours"
                />
              </div>
            </div>
            <div className="card">
              <div className="card-content">
                <ScatterPlot
                  data={chapterOutreachStats.map((s) => ({
                    label: s.name,
                    x: s.totalHours,
                    y: s.totalConversations,
                  }))}
                  title="Chapter Efficiency"
                  xAxisLabel="Total Activist Hours"
                  yAxisLabel="Total Conversations Logged"
                />
              </div>
            </div>
          </>
        )}

        {isChapterView && (
          <div className="card">
            <div className="card-content">
              <BarChart
                data={topActivists.map((a) => ({ label: a.name, value: a.value }))}
                title="Top 5 Activists by Hours"
              />
            </div>
          </div>
        )}
      </section>

      <div className="mt-16">
        <Challenges />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
