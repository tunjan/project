import React, { useMemo } from 'react';
import { OutreachOutcome, type OutreachLog } from '@/types';
import {
  UsersIcon,
  CheckCircleIcon,
  UserAddIcon,
  TrendingUpIcon,
  XCircleIcon,
} from '@/icons';

interface OutreachTallyProps {
  logs: OutreachLog[];
}

const outcomeMeta: Record<
  OutreachOutcome,
  { icon: React.FC<{ className?: string }>; color: string }
> = {
  [OutreachOutcome.BECAME_VEGAN_ACTIVIST]: {
    icon: UsersIcon,
    color: 'text-success',
  },
  [OutreachOutcome.BECAME_VEGAN]: {
    icon: CheckCircleIcon,
    color: 'text-primary',
  },
  [OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST]: {
    icon: UserAddIcon,
    color: 'text-neutral-700',
  },
  [OutreachOutcome.MOSTLY_SURE]: {
    icon: TrendingUpIcon,
    color: 'text-neutral-600',
  },
  [OutreachOutcome.NOT_SURE]: {
    icon: TrendingUpIcon,
    color: 'text-neutral-500',
  },
  [OutreachOutcome.NO_CHANGE]: { icon: XCircleIcon, color: 'text-neutral-400' },
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

  return (
    <div className="border-2 border-black bg-white p-4">
      <ul className="space-y-3">
        {Object.entries(tally).map(([outcome, count]) => {
          const { icon: Icon, color } = outcomeMeta[outcome as OutreachOutcome];
          return (
            <li
              key={outcome}
              className="flex items-center justify-between border-b border-neutral-200 pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center">
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${color}`} />
                <span className="text-sm font-semibold">{outcome}</span>
              </div>
              <span className="font-mono text-xl font-bold">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OutreachTally;
