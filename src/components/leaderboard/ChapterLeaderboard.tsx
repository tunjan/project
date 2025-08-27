import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type ChapterLeaderboardEntry,
  calculateRanks,
} from '@/utils/leaderboard';
import { BuildingOfficeIcon } from '@/icons';

interface ChapterLeaderboardProps {
  title: string;
  data: ChapterLeaderboardEntry[];
  unit: string;
}

const rankClasses: { [key: number]: string } = {
  1: 'bg-primary text-white',
  2: 'bg-black text-white',
  3: 'bg-white text-black',
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
    <div className="border-2 border-black bg-white">
      <h2 className="border-b-2 border-black p-4 text-xl font-bold text-black">
        {title}
      </h2>
      {rankedData.length > 0 ? (
        <ul className="divide-y-2 divide-black">
          {rankedData.map(({ chapter, value, rank }) => {
            const rankBG = rankClasses[rank] || 'bg-white text-black';
            return (
              <li
                key={chapter.name}
                onClick={() => handleChapterClick(chapter.name)}
                className="flex cursor-pointer items-stretch"
              >
                <div
                  className={`flex w-16 flex-shrink-0 items-center justify-center border-r-2 border-black text-2xl font-black ${rankBG}`}
                >
                  {rank}
                </div>
                <div className="flex flex-grow items-center p-4 transition-colors hover:bg-white">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 border-black bg-black">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-grow lg:max-w-none">
                    <p className="truncate font-bold text-black sm:max-w-xs">
                      {chapter.name}
                    </p>
                    <p className="text-white0 text-sm">{chapter.country}</p>
                  </div>
                  <div className="ml-2 flex-shrink-0 text-right">
                    <p className="text-xl font-extrabold text-black sm:text-2xl">
                      {value.toLocaleString()}
                    </p>
                    <p className="text-grey-600 text-xs font-semibold uppercase tracking-wider">
                      {unit}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-white0 p-8 text-center">
          <BuildingOfficeIcon className="text-grey-500 mx-auto h-12 w-12" />
          <p className="mt-2 font-semibold">No data available.</p>
          <p className="text-sm">There is no activity for this time period.</p>
        </div>
      )}
    </div>
  );
};

export default ChapterLeaderboard;
