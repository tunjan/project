import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type ChapterLeaderboardEntry,
  calculateRanks,
} from '@/utils/leaderboard';
import { BuildingOfficeIcon, TrophyIcon } from '@/icons';

interface ChapterLeaderboardProps {
  title: string;
  data: ChapterLeaderboardEntry[];
  unit: string;
}

const ChapterRankIndicator: React.FC<{ rank: number }> = ({ rank }) => {
  const rankStyles = {
    1: 'bg-yellow text-black border-black',
    2: 'bg-grey-300 text-black border-black',
    3: 'bg-yellow-700 text-white border-black', // Bronze color
  };

  const baseStyle =
    'flex w-16 flex-shrink-0 items-center justify-center border-r-2 border-black text-2xl font-black';
  const rankClass =
    rank <= 3 ? rankStyles[rank as 1 | 2 | 3] : 'bg-white text-black';

  return (
    <div className={`${baseStyle} ${rankClass}`}>
      {rank <= 3 ? <TrophyIcon className="h-6 w-6" /> : <span>{rank}</span>}
    </div>
  );
};

const ChapterLeaderboard: React.FC<ChapterLeaderboardProps> = ({
  title,
  data,
  unit,
}) => {
  const navigate = useNavigate();

  // Calculate proper ranks that handle ties
  const rankedData = calculateRanks(data);

  const handleChapterClick = (chapterName: string) => {
    navigate(`/chapters/${chapterName}`);
  };

  return (
    <div className="flex h-full flex-col border-2 border-black bg-white">
      <h2 className="border-b-2 border-black p-4 text-xl font-bold text-black">
        {title}
      </h2>
      <div className="flex-grow overflow-y-auto">
        {rankedData.length > 0 ? (
          <ul className="space-y-3 p-4">
            {rankedData.map(({ chapter, value, rank }) => {
              return (
                <li
                  key={chapter.name}
                  onClick={() => handleChapterClick(chapter.name)}
                  className="flex transform-gpu cursor-pointer items-stretch border-2 border-black bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-brutal"
                >
                  <ChapterRankIndicator rank={rank} />
                  <div className="flex flex-grow items-center p-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 border-black bg-black">
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <p className="truncate font-bold text-black">
                        {chapter.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {chapter.country}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      <p className="text-2xl font-extrabold text-black">
                        {value.toLocaleString()}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                        {unit}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-neutral-500">
            <BuildingOfficeIcon className="h-12 w-12" />
            <p className="mt-2 font-semibold text-black">No data available.</p>
            <p className="text-sm">
              There is no activity for this time period.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterLeaderboard;
