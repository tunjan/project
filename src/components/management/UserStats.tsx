import { Calendar, Clock, Map, MessageCircle, Target } from 'lucide-react';
import React, { useMemo } from 'react';

import LineChart from '@/components/analytics/LineChart';
import BadgeList from '@/components/dashboard/BadgeList';
import DiscountTierProgress from '@/components/dashboard/DiscountTierProgress';
import StatsGrid from '@/components/dashboard/StatsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useEvents, useOutreachLogs } from '@/store';
import { type User } from '@/types';
import { getConversationTrendsByMonth } from '@/utils';

interface UserStatsProps {
  user: User;
}

const UserStats: React.FC<UserStatsProps> = ({ user }) => {
  const allEvents = useEvents();
  const allOutreachLogs = useOutreachLogs();

  // Enhanced analytics data
  const userAnalytics = useMemo(() => {
    const userEvents = allEvents.filter((event) =>
      event.participants.some((p) => p.user.id === user.id)
    );

    const userOutreachLogs = allOutreachLogs.filter(
      (log) => log.userId === user.id
    );

    // Event participation details
    const attendedEvents = userEvents.filter(
      (event) => event.report?.attendance[user.id] === 'Attended'
    );

    const organizedEvents = allEvents.filter(
      (event) => event.organizer.id === user.id
    );

    // Outreach performance by outcome
    const outreachByOutcome = userOutreachLogs.reduce(
      (acc, log) => {
        acc[log.outcome] = (acc[log.outcome] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Monthly trends
    const monthlyData = getConversationTrendsByMonth(userOutreachLogs, 12);

    // City coverage
    const citiesVisited = new Set([
      ...user.stats.cities,
      ...attendedEvents.map((e) => e.city),
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOutreach = userOutreachLogs.filter(
      (log) => new Date(log.createdAt) > thirtyDaysAgo
    ).length;

    const recentEvents = attendedEvents.filter(
      (event) => new Date(event.startDate) > thirtyDaysAgo
    ).length;

    return {
      userEvents,
      userOutreachLogs,
      attendedEvents,
      organizedEvents,
      outreachByOutcome,
      monthlyData,
      citiesVisited: Array.from(citiesVisited),
      recentOutreach,
      recentEvents,
      totalHours: attendedEvents.reduce(
        (sum, event) => sum + (event.report?.hours || 0),
        0
      ),
      averageConversationsPerEvent:
        userOutreachLogs.length > 0 && attendedEvents.length > 0
          ? (userOutreachLogs.length / attendedEvents.length).toFixed(1)
          : '0',
    };
  }, [user, allEvents, allOutreachLogs]);

  return (
    <div className="space-y-8">
      {/* Enhanced Statistics Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-primary/10">
                    <Calendar className="size-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Events Attended</Label>
                    <p className="text-2xl font-bold">
                      {userAnalytics.attendedEvents.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-primary/10">
                    <MessageCircle className="size-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">
                      Total Conversations
                    </Label>
                    <p className="text-2xl font-bold">
                      {userAnalytics.userOutreachLogs.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-warning/10">
                    <Clock className="size-5 text-warning" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Total Hours</Label>
                    <p className="text-2xl font-bold">
                      {userAnalytics.totalHours}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center bg-muted">
                    <Map className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Cities Visited</Label>
                    <p className="text-2xl font-bold">
                      {userAnalytics.citiesVisited.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Outreach Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Outreach Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Monthly Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Conversation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={userAnalytics.monthlyData.map((d) => ({
                    label: new Date(d.month + '-02').toLocaleString('default', {
                      month: 'short',
                    }),
                    value: d.count,
                  }))}
                  title="Conversations per Month"
                />
              </CardContent>
            </Card>

            {/* Outreach Outcomes Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Conversation Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(userAnalytics.outreachByOutcome).map(
                    ([outcome, count]) => (
                      <div
                        key={outcome}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-muted-foreground">
                          {outcome}
                        </span>
                        <span className="text-lg font-bold">{count}</span>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-4 bg-muted p-3">
                  <p className="text-sm text-muted-foreground">
                    <Target className="mr-2 inline size-4" />
                    Avg: {userAnalytics.averageConversationsPerEvent}{' '}
                    conversations per event
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Event Participation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity (30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      New Conversations
                    </span>
                    <span className="text-lg font-bold">
                      {userAnalytics.recentOutreach}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Events Attended
                    </span>
                    <span className="text-lg font-bold">
                      {userAnalytics.recentEvents}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Event Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Events Organized
                    </span>
                    <span className="text-lg font-bold">
                      {userAnalytics.organizedEvents.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Total Participants
                    </span>
                    <span className="text-lg font-bold">
                      {userAnalytics.organizedEvents.reduce(
                        (sum, event) => sum + event.participants.length,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Original Stats Components */}
      <Card>
        <CardHeader>
          <CardTitle>Core Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <StatsGrid stats={user.stats} />
        </CardContent>
      </Card>

      {user.badges && user.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recognitions & Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeList badges={user.badges} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Discount Tier Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <DiscountTierProgress user={user} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;
