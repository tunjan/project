import React from 'react';
import { type ChapterStats } from '../../utils/analytics';
import { MapPinIcon, UsersIcon, ClockIcon, BuildingOfficeIcon } from '../icons';

interface ChapterCardProps {
    chapterStats: ChapterStats;
    onSelect: () => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ chapterStats, onSelect }) => {
    return (
        <div 
            onClick={onSelect}
            className="bg-white rounded-none border border-black overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            <div className="p-6">
                 <p className="text-sm font-semibold text-[#d81313] uppercase tracking-wide">{chapterStats.country}</p>
                 <h3 className="mt-1 text-2xl font-bold text-black">{chapterStats.name}</h3>

                 <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                        <UsersIcon className="w-5 h-5 mr-2 text-neutral-400" />
                        <div>
                            <p className="font-bold">{chapterStats.memberCount}</p>
                            <p className="text-neutral-600">Members</p>
                        </div>
                    </div>
                     <div className="flex items-center">
                        <BuildingOfficeIcon className="w-5 h-5 mr-2 text-neutral-400" />
                        <div>
                            <p className="font-bold">{chapterStats.eventsHeld}</p>
                            <p className="text-neutral-600">Events Held</p>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    )
}

export default ChapterCard;
