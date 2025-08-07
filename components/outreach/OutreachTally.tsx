import React, { useMemo } from 'react';
import { OutreachOutcome, type OutreachLog } from '../../types';
import { UsersIcon, CheckCircleIcon, UserAddIcon, TrendingUpIcon, SearchIcon, XCircleIcon } from '../icons';

interface OutreachTallyProps {
    logs: OutreachLog[];
}

const outcomeMeta: Record<OutreachOutcome, { icon: React.FC<{className?:string}>; color: string }> = {
    [OutreachOutcome.BECAME_VEGAN_ACTIVIST]: { icon: UsersIcon, color: 'text-green-600' },
    [OutreachOutcome.BECAME_VEGAN]: { icon: CheckCircleIcon, color: 'text-green-500' },
    [OutreachOutcome.ALREADY_VEGAN_NOW_ACTIVIST]: { icon: UserAddIcon, color: 'text-blue-500' },
    [OutreachOutcome.MOSTLY_SURE]: { icon: TrendingUpIcon, color: 'text-yellow-500' },
    [OutreachOutcome.NOT_SURE]: { icon: SearchIcon, color: 'text-gray-500' },
    [OutreachOutcome.NO_CHANGE]: { icon: XCircleIcon, color: 'text-red-600' },
};

const TallyCard: React.FC<{ outcome: OutreachOutcome; count: number }> = ({ outcome, count }) => {
    const { icon: Icon, color } = outcomeMeta[outcome];

    return (
        <div className="bg-white border border-black p-4">
            <div className="flex items-center">
                <div className={color}>
                    <Icon className="w-6 h-6" />
                </div>
                <p className="ml-3 text-sm font-semibold uppercase tracking-wider text-neutral-600 truncate">{outcome}</p>
            </div>
            <p className="mt-2 text-4xl font-extrabold text-black">{count}</p>
        </div>
    );
};

const OutreachTally: React.FC<OutreachTallyProps> = ({ logs }) => {
    const tally = useMemo(() => {
        const initialTally = Object.fromEntries(
            Object.values(OutreachOutcome).map(outcome => [outcome, 0])
        ) as Record<OutreachOutcome, number>;
        
        return logs.reduce((acc, log) => {
            acc[log.outcome]++;
            return acc;
        }, initialTally);
    }, [logs]);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-black border-b-2 border-[#d81313] pb-2">Your Tally</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(tally).map(([outcome, count]) => (
                    <TallyCard key={outcome} outcome={outcome as OutreachOutcome} count={count} />
                ))}
            </div>
        </div>
    );
};

export default OutreachTally;
