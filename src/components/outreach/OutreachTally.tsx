import {
  CheckCircle,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useMemo } from 'react';

import { type OutreachLog, OutreachOutcome } from '@/types';

const OUTCOME_LABELS: Record<OutreachOutcome, string> = {
  [OutreachOutcome.BECAME_VEGAN_ACTIVIST]: 'Became Activist',
  [OutreachOutcome.BECAME_VEGAN]: 'Became Vegan',
  [OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST]: 'Vegan to Activist',
  [OutreachOutcome.MOSTLY_SURE]: 'Mostly Sure',
  [OutreachOutcome.NOT_SURE]: 'Not Sure',
  [OutreachOutcome.NO_CHANGE]: 'No Change',
};

interface OutreachTallyProps {
  logs: OutreachLog[];
}

const outcomeMeta: Record<
  OutreachOutcome,
  {
    icon: React.FC<{ className?: string }>;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    description: string;
  }
> = {
  [OutreachOutcome.BECAME_VEGAN_ACTIVIST]: {
    icon: Users,
    variant: 'default',
    description: 'New vegan activists',
  },
  [OutreachOutcome.BECAME_VEGAN]: {
    icon: CheckCircle,
    variant: 'default',
    description: 'New vegans',
  },
  [OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST]: {
    icon: UserPlus,
    variant: 'secondary',
    description: 'Vegans turned activists',
  },
  [OutreachOutcome.MOSTLY_SURE]: {
    icon: TrendingUp,
    variant: 'outline',
    description: 'Mostly convinced',
  },
  [OutreachOutcome.NOT_SURE]: {
    icon: TrendingUp,
    variant: 'outline',
    description: 'Still considering',
  },
  [OutreachOutcome.NO_CHANGE]: {
    icon: XCircle,
    variant: 'destructive',
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
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-foreground">
            {totalConversations}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Total Conversations
          </div>
        </div>
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-green-600">
            {positiveOutcomes}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Positive Outcomes
          </div>
        </div>
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-primary">
            {totalConversations > 0
              ? Math.round((positiveOutcomes / totalConversations) * 100)
              : 0}
            %
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Success Rate
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">
          Outcome Breakdown
        </h4>
        <div className="space-y-3">
          {Object.entries(tally).map(([outcome, count]) => {
            const { icon: Icon, description } =
              outcomeMeta[outcome as OutreachOutcome];
            const percentage =
              totalConversations > 0 ? (count / totalConversations) * 100 : 0;

            return (
              <div
                key={outcome}
                className="flex items-center justify-between rounded-xl border bg-card/50 p-4 transition-colors hover:bg-card/80"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50">
                    <Icon className="size-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {OUTCOME_LABELS[outcome as OutreachOutcome]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OutreachTally;
