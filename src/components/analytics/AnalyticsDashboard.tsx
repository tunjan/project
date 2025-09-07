import {
  Clock,
  Globe,
  MessageCircle,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import Challenges from '@/components/challenges/Challenges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useChallenges } from '@/store';

import BarChart from './BarChart';
import ChapterScorecard from './ChapterScorecard';
import Histogram, { HistogramData } from './Histogram';
import LineChart from './LineChart';
import ScatterPlot from './ScatterPlot';

type AnalyticsDashboardProps = Record<string, never>;

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  tooltip?: string;
}> = ({ icon, title, value, tooltip }) => (
  <Card className="group relative">
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className="text-primary">{icon}</div>
        <p className="ml-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      </div>
      <p className="mt-2 text-4xl font-extrabold text-foreground">{value}</p>
      {tooltip && (
        <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-max rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100">
          {tooltip}
        </div>
      )}
    </CardContent>
  </Card>
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

  const activistHoursHistogramData = useMemo((): HistogramData[] => {
    if (!activistHoursDistribution || activistHoursDistribution.length === 0)
      return [];

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Analytics: {viewTitle}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Comprehensive insights into chapter performance, member
                engagement, and outreach impact.
              </p>
            </div>
          </div>
          <Separator />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="country-filter"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    View
                  </Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={(value) =>
                      handleCountryChange({
                        target: { value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    disabled={availableCountries.length <= 1}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country === 'global'
                            ? 'Global'
                            : `${country} Region`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="chapter-filter"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Chapter
                  </Label>
                  <Select
                    value={selectedChapter}
                    onValueChange={(value) =>
                      handleChapterChange({
                        target: { value },
                      } as React.ChangeEvent<HTMLSelectElement>)
                    }
                    disabled={chaptersInSelectedCountry.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chapters</SelectItem>
                      {chaptersInSelectedCountry.map((chapter) => (
                        <SelectItem key={chapter.name} value={chapter.name}>
                          {chapter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as 'overview' | 'chapters' | 'distributions')
          }
        >
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview & Trends</TabsTrigger>
            <TabsTrigger value="chapters">Chapter Analysis</TabsTrigger>
            <TabsTrigger value="distributions">
              Performance Distributions
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-12">
            <div className="space-y-12">
              <section>
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Overview
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                  <StatCard
                    icon={<Users className="size-6" />}
                    title="Total Members"
                    value={overviewStats.totalMembers.toLocaleString()}
                    tooltip="Total number of confirmed activists in the selected scope."
                  />
                  <StatCard
                    icon={<Clock className="size-6" />}
                    title="Total Hours"
                    value={overviewStats.totalHours.toLocaleString()}
                    tooltip="Sum of all activist hours contributed in the selected scope."
                  />
                  <StatCard
                    icon={<MessageCircle className="size-6" />}
                    title="Total Convos"
                    value={overviewStats.totalConversations.toLocaleString()}
                    tooltip="Total number of outreach conversations logged."
                  />
                  <StatCard
                    icon={<Globe className="size-6" />}
                    title="Total Events"
                    value={overviewStats.totalEvents.toLocaleString()}
                    tooltip="Total number of events held."
                  />
                  <StatCard
                    icon={<TrendingUp className="size-6" />}
                    title="Convos / Hour"
                    value={overviewStats.conversationsPerHour.toFixed(2)}
                    tooltip="Average conversations per hour of activism. A measure of outreach efficiency."
                  />
                </div>
              </section>

              <section>
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Key Metrics
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <StatCard
                    icon={<UserCheck className="size-6" />}
                    title="Activist Retention"
                    value={`${(activistRetention.rate * 100).toFixed(0)}%`}
                    tooltip="Members active (attended an event) in the last 3 months."
                  />
                  <StatCard
                    icon={<Users className="size-6" />}
                    title="Avg. Activists/Event"
                    value={avgActivistsPerEvent.toFixed(1)}
                    tooltip="Average number of participants per event."
                  />
                </div>
              </section>
              <section>
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  Activity Trends
                </h2>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Events per Month</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <LineChart
                        data={eventTrends.map((t) => ({
                          label: t.month.split(' ')[0],
                          value: t.count,
                        }))}
                        title="Events per Month"
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversations per Month</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <LineChart
                        data={conversationTrends.map((t) => ({
                          label: t.month.split(' ')[0],
                          value: t.count,
                        }))}
                        title="Conversations per Month"
                        lineColor="hsl(var(--chart-1))"
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>New Members per Month</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <LineChart
                        title="New Members per Month"
                        data={memberGrowth.map((t) => ({
                          label: t.month.split(' ')[0],
                          value: t.count,
                        }))}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Members (Cumulative)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <LineChart
                        title="Total Members (Cumulative)"
                        data={totalMembersByMonth.map((t) => ({
                          label: t.month.split(' ')[0],
                          value: t.count,
                        }))}
                      />
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="chapters" className="space-y-12">
            <div className="space-y-12">
              {!isChapterView ? (
                <>
                  <ChapterScorecard />
                  <section>
                    <h2 className="mb-6 text-2xl font-bold text-foreground">
                      Chapter Performance
                    </h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            Top 5 Chapters by Activist Hours
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <BarChart
                            data={topChaptersByHours}
                            title="Top 5 Chapters by Activist Hours"
                          />
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Chapter Efficiency</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
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
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                </>
              ) : (
                <section>
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    Activist Performance
                  </h2>
                  <Card>
                    <CardHeader>
                      <CardTitle>Top 5 Activists by Hours</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <BarChart
                        data={topActivists.map((a) => ({
                          label: a.name,
                          value: a.value,
                        }))}
                        title="Top 5 Activists by Hours"
                      />
                    </CardContent>
                  </Card>
                </section>
              )}
              <Challenges challenges={challenges} />
            </div>
          </TabsContent>

          <TabsContent value="distributions" className="space-y-12">
            <section>
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Performance Distributions
              </h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Activist Hours Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Histogram
                      data={activistHoursHistogramData}
                      title="Activist Hours Distribution"
                      xAxisLabel="Total Hours"
                      yAxisLabel="Number of Activists"
                      barColor="hsl(var(--chart-2))"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Activist Conversations Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Histogram
                      data={activistConversationsHistogramData}
                      title="Activist Conversations Distribution"
                      xAxisLabel="Total Conversations"
                      yAxisLabel="Number of Activists"
                      barColor="hsl(var(--chart-3))"
                    />
                  </CardContent>
                </Card>
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Turnout Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Histogram
                        data={eventTurnoutDistribution}
                        title="Event Turnout Distribution"
                        xAxisLabel="Number of Participants"
                        yAxisLabel="Number of Events"
                        barColor="hsl(var(--chart-4))"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
