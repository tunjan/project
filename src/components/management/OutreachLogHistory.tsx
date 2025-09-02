import React, { useMemo } from 'react';

import {
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  MapIcon,
  MinusIcon,
  XCircleIcon,
} from '@/icons';
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

  const getOutcomeColor = (outcome: OutreachOutcome) => {
    const positiveOutcomes = [
      OutreachOutcome.BECAME_VEGAN_ACTIVIST,
      OutreachOutcome.BECAME_VEGAN,
      OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST,
    ];

    if (positiveOutcomes.includes(outcome)) return 'text-success';
    if (outcome === OutreachOutcome.NO_CHANGE) return 'text-neutral-500';
    return 'text-warning';
  };

  const getOutcomeIcon = (outcome: OutreachOutcome) => {
    const positiveOutcomes = [
      OutreachOutcome.BECAME_VEGAN_ACTIVIST,
      OutreachOutcome.BECAME_VEGAN,
      OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST,
    ];

    if (positiveOutcomes.includes(outcome))
      return <CheckCircleIcon className="size-4 text-success" />;
    if (outcome === OutreachOutcome.NO_CHANGE)
      return <MinusIcon className="size-4 text-neutral-400" />;
    return <XCircleIcon className="size-4 text-warning" />;
  };

  if (userOutreachData.userLogs.length === 0) {
    return (
      <div className="rounded-none border-black bg-white p-8 text-center shadow-brutal md:border-2">
        <div className="mx-auto mb-4 size-16 rounded-full bg-neutral-100 p-4">
          <ChatBubbleLeftRightIcon className="size-8 text-neutral-400" />
        </div>
        <h3 className="text-xl font-bold text-black">No Outreach History</h3>
        <p className="mt-2 text-neutral-600">
          This member hasn't logged any outreach conversations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-black">Outreach Overview</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-none border-black bg-white p-4 md:border-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">
                {userOutreachData.totalConversations}
              </p>
              <p className="text-sm text-neutral-600">Total Conversations</p>
            </div>
          </div>

          <div className="rounded-none border-black bg-white p-4 md:border-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {userOutreachData.successRate}%
              </p>
              <p className="text-sm text-neutral-600">Success Rate</p>
            </div>
          </div>

          <div className="rounded-none border-black bg-white p-4 md:border-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {userOutreachData.eventsWithLogs}
              </p>
              <p className="text-sm text-neutral-600">Events with Logs</p>
            </div>
          </div>

          <div className="rounded-none border-black bg-white p-4 md:border-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {userOutreachData.recentLogs.length}
              </p>
              <p className="text-sm text-neutral-600">Recent (30d)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Outcomes Breakdown */}
      <div className="rounded-none border-black bg-white p-6 md:border-2">
        <h4 className="mb-4 text-lg font-bold text-black">
          Conversation Outcomes Breakdown
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(userOutreachData.outcomesBreakdown).map(
            ([outcome, count]) => (
              <div
                key={outcome}
                className="flex items-center justify-between bg-neutral-50 p-3"
              >
                <div className="flex items-center gap-2">
                  {getOutcomeIcon(outcome as OutreachOutcome)}
                  <span className="text-sm font-medium text-neutral-700">
                    {outcome}
                  </span>
                </div>
                <span
                  className={`text-lg font-bold ${getOutcomeColor(outcome as OutreachOutcome)}`}
                >
                  {count}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Detailed Logs by Event */}
      <div>
        <h4 className="mb-4 text-lg font-bold text-black">
          Conversations by Event
        </h4>
        <div className="space-y-4">
          {Object.values(userOutreachData.logsByEvent).map(
            ({ event, logs, totalConversations, outcomes }) => (
              <div
                key={event.id}
                className="rounded-none border-black bg-white p-6 md:border-2"
              >
                <div className="mb-4">
                  <h5 className="text-lg font-bold text-black">{event.name}</h5>
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                      <MapIcon className="size-4" />
                      {event.city}, {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="size-4" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <ChatBubbleLeftRightIcon className="size-4" />
                      {totalConversations} conversations
                    </span>
                  </div>
                </div>

                {/* Outcomes for this event */}
                <div className="mb-4">
                  <p className="mb-2 text-sm font-bold text-neutral-600">
                    Outcomes at this event:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(outcomes).map(([outcome, count]) => (
                      <span
                        key={outcome}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          getOutcomeColor(outcome as OutreachOutcome) ===
                          'text-success'
                            ? 'bg-success/10 text-success'
                            : getOutcomeColor(outcome as OutreachOutcome) ===
                                'text-warning'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {outcome}: {count}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Individual log entries */}
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="bg-neutral-50 p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            {getOutcomeIcon(log.outcome)}
                            <span
                              className={`font-semibold ${getOutcomeColor(log.outcome)}`}
                            >
                              {log.outcome}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {log.notes && (
                            <p className="mt-1 text-sm text-neutral-700">
                              {log.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default OutreachLogHistory;
