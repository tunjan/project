import React, { useMemo } from 'react';

import {
  CheckCircleIcon,
  TrendingUpIcon,
  UserAddIcon,
  UsersIcon,
  XCircleIcon,
} from '@/icons';
import { type OutreachLog, OutreachOutcome } from '@/types';

interface OutreachTallyProps {
  logs: OutreachLog[];
}

const outcomeMeta: Record<
  OutreachOutcome,
  {
    icon: React.FC<{ className?: string }>;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  [OutreachOutcome.BECAME_VEGAN_ACTIVIST]: {
    icon: UsersIcon,
    color: 'text-success',
    bgColor: 'bg-success/10',
    description: 'New vegan activists',
  },
  [OutreachOutcome.BECAME_VEGAN]: {
    icon: CheckCircleIcon,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: 'New vegans',
  },
  [OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST]: {
    icon: UserAddIcon,
    color: 'text-info',
    bgColor: 'bg-info/10',
    description: 'Vegans turned activists',
  },
  [OutreachOutcome.MOSTLY_SURE]: {
    icon: TrendingUpIcon,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    description: 'Mostly convinced',
  },
  [OutreachOutcome.NOT_SURE]: {
    icon: TrendingUpIcon,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    description: 'Still considering',
  },
  [OutreachOutcome.NO_CHANGE]: {
    icon: XCircleIcon,
    color: 'text-neutral-400',
    bgColor: 'bg-neutral-50',
    description: 'No change in stance',
  },
};

const OutreachTally: React.FC<OutreachTallyProps> = ({ logs }) => {
  const tally = useMemo(() => {
    const initialTally = Object.fromEntries(
      Object.values(OutreachOutcome).map((outcome) => [outcome, 0])
    ) as Record<OutreachOutcome, number>;

    return logs.reduce((acc, log) => {
      acc[log.outcome]++;
      return acc;
    }, initialTally);
  }, [logs]);

  const totalConversations = useMemo(() => {
    return Object.values(tally).reduce((sum, count) => sum + count, 0);
  }, [tally]);

  const positiveOutcomes = useMemo(() => {
    return (
      tally[OutreachOutcome.BECAME_VEGAN_ACTIVIST] +
      tally[OutreachOutcome.BECAME_VEGAN] +
      tally[OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST]
    );
  }, [tally]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-none border-black bg-white p-4 text-center shadow-brutal hover:shadow-brutal-lg md:border-2">
          <div className="text-2xl font-bold text-black">
            {totalConversations}
          </div>
          <div className="text-sm font-medium text-neutral-600">
            Total Conversations
          </div>
        </div>
        <div className="rounded-none border-black bg-white p-4 text-center shadow-brutal hover:shadow-brutal-lg md:border-2">
          <div className="text-2xl font-bold text-success">
            {positiveOutcomes}
          </div>
          <div className="text-sm font-medium text-neutral-600">
            Positive Outcomes
          </div>
        </div>
        <div className="rounded-none border-black bg-white p-4 text-center shadow-brutal hover:shadow-brutal-lg md:border-2">
          <div className="text-2xl font-bold text-primary">
            {totalConversations > 0
              ? Math.round((positiveOutcomes / totalConversations) * 100)
              : 0}
            %
          </div>
          <div className="text-sm font-medium text-neutral-600">
            Success Rate
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="rounded-none border-black bg-white p-6 md:border-2">
        <h3 className="mb-4 text-lg font-bold text-black">Outcome Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(tally).map(([outcome, count]) => {
            const {
              icon: Icon,
              color,
              bgColor,
              description,
            } = outcomeMeta[outcome as OutreachOutcome];
            const percentage =
              totalConversations > 0 ? (count / totalConversations) * 100 : 0;

            return (
              <div
                key={outcome}
                className="group relative overflow-hidden rounded-none border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:bg-neutral-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex size-12 items-center justify-center rounded-none ${bgColor}`}
                    >
                      <Icon className={`size-6 ${color}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-black">{outcome}</div>
                      <div className="text-sm text-neutral-600">
                        {description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-black">{count}</div>
                    <div className="text-sm text-neutral-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {totalConversations > 0 && (
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className={`h-full ${bgColor.replace('/10', '')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OutreachTally;
