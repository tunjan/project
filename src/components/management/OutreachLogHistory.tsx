import {
  Calendar,
  CheckCircle,
  Map,
  MessageSquare,
  Minus,
  XCircle,
} from 'lucide-react';
import React, { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEvents, useOutreachLogs } from '@/store';
import {
  type CubeEvent,
  type OutreachLog,
  OutreachOutcome,
  type User,
} from '@/types';

interface OutreachLogHistoryProps {
  user: User;
}

const OutreachLogHistory: React.FC<OutreachLogHistoryProps> = ({ user }) => {
  const allEvents = useEvents();
  const allOutreachLogs = useOutreachLogs();

  const userOutreachData = useMemo(() => {
    const userLogs = allOutreachLogs.filter((log) => log.userId === user.id);

    // Group logs by event
    const logsByEvent = userLogs.reduce(
      (acc, log) => {
        const event = allEvents.find((e) => e.id === log.eventId);
        if (!event) return acc;

        if (!acc[event.id]) {
          acc[event.id] = {
            event,
            logs: [],
            totalConversations: 0,
            outcomes: {} as Record<OutreachOutcome, number>,
          };
        }

        acc[event.id].logs.push(log);
        acc[event.id].totalConversations++;
        acc[event.id].outcomes[log.outcome] =
          (acc[event.id].outcomes[log.outcome] || 0) + 1;

        return acc;
      },
      {} as Record<
        string,
        {
          event: CubeEvent;
          logs: OutreachLog[];
          totalConversations: number;
          outcomes: Record<OutreachOutcome, number>;
        }
      >
    );

    // Calculate overall statistics
    const totalConversations = userLogs.length;
    const outcomesBreakdown = userLogs.reduce(
      (acc, log) => {
        acc[log.outcome] = (acc[log.outcome] || 0) + 1;
        return acc;
      },
      {} as Record<OutreachOutcome, number>
    );

    // Calculate success rate (positive outcomes)
    const positiveOutcomes = [
      OutreachOutcome.BECAME_VEGAN_ACTIVIST,
      OutreachOutcome.BECAME_VEGAN,
      OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST,
    ];
    const successCount = userLogs.filter((log) =>
      positiveOutcomes.includes(log.outcome)
    ).length;
    const successRate =
      totalConversations > 0
        ? ((successCount / totalConversations) * 100).toFixed(1)
        : '0';

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = userLogs.filter(
      (log) => new Date(log.createdAt) > thirtyDaysAgo
    );

    return {
      userLogs,
      logsByEvent,
      totalConversations,
      outcomesBreakdown,
      successRate,
      successCount,
      recentLogs,
      eventsWithLogs: Object.keys(logsByEvent).length,
    };
  }, [user, allEvents, allOutreachLogs]);

  const getOutcomeStyling = (outcome: OutreachOutcome) => {
    const positiveOutcomes = [
      OutreachOutcome.BECAME_VEGAN_ACTIVIST,
      OutreachOutcome.BECAME_VEGAN,
      OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST,
    ];

    if (positiveOutcomes.includes(outcome)) {
      return {
        variant: 'default' as const,
        icon: <CheckCircle className="size-4 text-success" />,
        textColor: 'text-success',
        badgeVariant: 'default' as const,
        badgeClassName:
          'border-transparent bg-success text-success-foreground hover:bg-success/80',
      };
    }
    if (outcome === OutreachOutcome.NO_CHANGE) {
      return {
        variant: 'secondary' as const,
        icon: <Minus className="size-4 text-muted-foreground" />,
        textColor: 'text-muted-foreground',
        badgeVariant: 'secondary' as const,
        badgeClassName: '',
      };
    }
    return {
      variant: 'destructive' as const,
      icon: <XCircle className="size-4 text-destructive" />,
      textColor: 'text-destructive',
      badgeVariant: 'destructive' as const,
      badgeClassName: '',
    };
  };

  if (userOutreachData.userLogs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No Outreach History</h3>
          <p className="mt-2 text-muted-foreground">
            This member hasn't logged any outreach conversations yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div>
        <h3 className="h-section">Outreach Overview</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {userOutreachData.totalConversations}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Success Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">
                {userOutreachData.successRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Events with Logs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {userOutreachData.eventsWithLogs}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Recent (30d)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-500">
                {userOutreachData.recentLogs.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Outcomes Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation Outcomes Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(userOutreachData.outcomesBreakdown).map(
            ([outcome, count]) => {
              const styling = getOutcomeStyling(outcome as OutreachOutcome);
              return (
                <div
                  key={outcome}
                  className="flex items-center justify-between rounded-lg bg-muted p-3"
                >
                  <div className="flex items-center gap-2">
                    {styling.icon}
                    <span className="text-sm font-medium text-foreground">
                      {outcome}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${styling.textColor}`}>
                    {count}
                  </span>
                </div>
              );
            }
          )}
        </CardContent>
      </Card>

      {/* Detailed Logs by Event */}
      <div>
        <h3 className="h-section">Conversations by Event</h3>
        <div className="space-y-4">
          {Object.values(userOutreachData.logsByEvent).map(
            ({ event, logs, totalConversations, outcomes }) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Map className="size-4" />
                      {event.city}, {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-4" />
                      {totalConversations} conversations
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Outcomes for this event */}
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-bold text-muted-foreground">
                      Outcomes at this event:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(outcomes).map(([outcome, count]) => {
                        const styling = getOutcomeStyling(
                          outcome as OutreachOutcome
                        );
                        return (
                          <Badge
                            key={outcome}
                            variant={styling.badgeVariant}
                            className={styling.badgeClassName}
                          >
                            {outcome}: {count}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual log entries */}
                  <div className="space-y-2">
                    {logs.map((log) => {
                      const styling = getOutcomeStyling(log.outcome);
                      return (
                        <div key={log.id} className="rounded-md bg-muted p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                {styling.icon}
                                <span
                                  className={`font-semibold ${styling.textColor}`}
                                >
                                  {log.outcome}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {log.notes && (
                                <p className="mt-1 text-sm text-foreground">
                                  {log.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default OutreachLogHistory;
