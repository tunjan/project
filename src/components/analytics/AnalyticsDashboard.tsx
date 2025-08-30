import React, { useMemo, useState } from 'react';

import Challenges from '@/components/challenges/Challenges';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  GlobeAltIcon,
  TrendingUpIcon,
  UserGroupIcon,
  UsersIcon,
} from '@/icons';
import { useChallenges } from '@/store';

import BarChart from './BarChart';
import ChapterScorecard from './ChapterScorecard';
import Histogram, { HistogramData } from './Histogram';
import LineChart from './LineChart';
import ScatterPlot from './ScatterPlot';

interface AnalyticsDashboardProps {}

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`-mb-px w-full border-b-4 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200 ${
      isActive
        ? 'border-primary text-primary'
        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-black'
    }`}
  >
    {children}
  </button>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  tooltip?: string;
}> = ({ icon, title, value, tooltip }) => (
  <div className="group relative border-2 border-black bg-white p-4">
    <div className="flex items-center">
      <div className="text-primary">{icon}</div>
      <p className="ml-3 text-sm font-semibold uppercase tracking-wider text-neutral-600">
        {title}
      </p>
    </div>
    <p className="mt-2 text-4xl font-extrabold text-black">{value}</p>
    {tooltip && (
      <div className="rounded-nonenone pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-max bg-black px-2 py-1 text-xs font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {tooltip}
      </div>
    )}
  </div>
);

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const challenges = useChallenges();
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
    activistHoursDistribution,
    activistConversationsDistribution,
    eventTurnoutDistribution,
  } = useAnalyticsData();

  // Create proper histogram data from activist performance data
  const activistHoursHistogramData = useMemo((): HistogramData[] => {
    if (!activistHoursDistribution || activistHoursDistribution.length === 0)
      return [];

    // Create bins for hours distribution
    const maxHours = Math.max(...activistHoursDistribution.map((d) => d.value));
    if (maxHours === 0)
      return [{ range: '0', count: activistHoursDistribution.length }];

    const binSize = Math.ceil(maxHours / 5) || 1;
    const bins = Array(5).fill(0);

    activistHoursDistribution.forEach((item) => {
      const binIndex = Math.min(Math.floor(item.value / binSize), 4);
      bins[binIndex]++;
    });

    return bins.map((count, i) => {
      const lower = i * binSize;
      const upper = (i + 1) * binSize - 1;
      return {
        range: `${lower}-${upper}`,
        count,
      };
    });
  }, [activistHoursDistribution]);

  const activistConversationsHistogramData = useMemo((): HistogramData[] => {
    if (
      !activistConversationsDistribution ||
      activistConversationsDistribution.length === 0
    )
      return [];

    // Create bins for conversations distribution
    const maxConversations = Math.max(
      ...activistConversationsDistribution.map((d) => d.value)
    );
    if (maxConversations === 0)
      return [{ range: '0', count: activistConversationsDistribution.length }];

    const binSize = Math.ceil(maxConversations / 5) || 1;
    const bins = Array(5).fill(0);

    activistConversationsDistribution.forEach((item) => {
      const binIndex = Math.min(Math.floor(item.value / binSize), 4);
      bins[binIndex]++;
    });

    return bins.map((count, i) => {
      const lower = i * binSize;
      const upper = (i + 1) * binSize - 1;
      return {
        range: `${lower}-${upper}`,
        count,
      };
    });
  }, [activistConversationsDistribution]);

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
        <p className="mt-3 max-w-2xl text-lg text-neutral-600">
          Organization performance metrics and impact tracking. Use the filters
          to drill down.
        </p>
      </div>

      {/* Filters */}
      {/* Filters */}
      <div className="mb-8 border-2 border-black bg-white p-6">
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
              className="rounded-nonenone w-full border border-black bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-white sm:text-sm"
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
              className="rounded-nonenone w-full border border-black bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-white sm:text-sm"
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

      {/* Tab Navigation */}
      <div className="mb-8 flex border-b-2 border-black">
        <TabButton
          onClick={() => setActiveTab('overview')}
          isActive={activeTab === 'overview'}
        >
          Overview & Trends
        </TabButton>
        <TabButton
          onClick={() => setActiveTab('chapters')}
          isActive={activeTab === 'chapters'}
        >
          Chapter Analysis
        </TabButton>
        <TabButton
          onClick={() => setActiveTab('distributions')}
          isActive={activeTab === 'distributions'}
        >
          Performance Distributions
        </TabButton>
      </div>

      {/* Tab Content */}
      <div className="space-y-12">
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <section>
              <h2 className="mb-6 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Overview
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                  icon={<UsersIcon className="size-6" />}
                  title="Total Members"
                  value={overviewStats.totalMembers.toLocaleString()}
                  tooltip="Total number of confirmed activists in the selected scope."
                />
                <StatCard
                  icon={<ClockIcon className="size-6" />}
                  title="Total Hours"
                  value={overviewStats.totalHours.toLocaleString()}
                  tooltip="Sum of all activist hours contributed in the selected scope."
                />
                <StatCard
                  icon={<ChatBubbleLeftRightIcon className="size-6" />}
                  title="Total Conversations"
                  value={overviewStats.totalConversations.toLocaleString()}
                  tooltip="Total number of outreach conversations logged."
                />
                <StatCard
                  icon={<GlobeAltIcon className="size-6" />}
                  title="Total Events"
                  value={overviewStats.totalEvents.toLocaleString()}
                  tooltip="Total number of events held."
                />
                <StatCard
                  icon={<TrendingUpIcon className="size-6" />}
                  title="Convos / Hour"
                  value={overviewStats.conversationsPerHour.toFixed(2)}
                  tooltip="Average conversations per hour of activism. A measure of outreach efficiency."
                />
              </div>
            </section>

            <section>
              <h2 className="mb-6 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Key Metrics
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <StatCard
                  icon={<UsersIcon className="size-6" />}
                  title="Activist Retention"
                  value={`${(activistRetention.rate * 100).toFixed(0)}%`}
                  tooltip="Members active (attended an event) in the last 3 months."
                />
                <StatCard
                  icon={<UserGroupIcon className="size-6" />}
                  title="Avg. Activists/Event"
                  value={avgActivistsPerEvent.toFixed(1)}
                  tooltip="Average number of participants per event."
                />
              </div>
            </section>
            <section>
              <h2 className="mb-6 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                Activity Trends
              </h2>
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                <LineChart
                  data={eventTrends.map((t) => ({
                    label: t.month.split(' ')[0],
                    value: t.count,
                  }))}
                  title="Events per Month"
                />
                <LineChart
                  data={conversationTrends.map((t) => ({
                    label: t.month.split(' ')[0],
                    value: t.count,
                  }))}
                  title="Conversations per Month"
                  lineColor="#6b7280" // TODO: Replace with theme color
                />
                <LineChart
                  title="New Members per Month"
                  data={memberGrowth.map((t) => ({
                    label: t.month.split(' ')[0],
                    value: t.count,
                  }))}
                />
                <LineChart
                  title="Total Members (Cumulative)"
                  data={totalMembersByMonth.map((t) => ({
                    label: t.month.split(' ')[0],
                    value: t.count,
                  }))}
                />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="space-y-12">
            {!isChapterView ? (
              <>
                <ChapterScorecard />
                <section>
                  <h2 className="mb-6 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                    Chapter Performance
                  </h2>
                  <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    <BarChart
                      data={topChaptersByHours}
                      title="Top 5 Chapters by Activist Hours"
                    />
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
                </section>
              </>
            ) : (
              <section>
                <h2 className="mb-6 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
                  Activist Performance
                </h2>
                <BarChart
                  data={topActivists.map((a) => ({
                    label: a.name,
                    value: a.value,
                  }))}
                  title="Top 5 Activists by Hours"
                />
              </section>
            )}
            <Challenges challenges={challenges} />
          </div>
        )}

        {activeTab === 'distributions' && (
          <section>
            <h2 className="mb-6 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
              Performance Distributions
            </h2>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <Histogram
                data={activistHoursHistogramData}
                title="Activist Hours Distribution"
                xAxisLabel="Total Hours"
                yAxisLabel="Number of Activists"
                barColor="#ef4444" // danger-500
              />
              <Histogram
                data={activistConversationsHistogramData}
                title="Activist Conversations Distribution"
                xAxisLabel="Total Conversations"
                yAxisLabel="Number of Activists"
                barColor="#6b7280" // neutral-500
              />
              <div className="lg:col-span-2">
                <Histogram
                  data={eventTurnoutDistribution}
                  title="Event Turnout Distribution"
                  xAxisLabel="Number of Participants"
                  yAxisLabel="Number of Events"
                  barColor="#1f2937" // neutral-800
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
