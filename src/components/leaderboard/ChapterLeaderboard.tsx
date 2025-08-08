import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type ChapterLeaderboardEntry } from '@/utils/leaderboard';
import { BuildingOfficeIcon } from '@/icons';

interface ChapterLeaderboardProps {
  title: string;
  data: ChapterLeaderboardEntry[];
  unit: string;
}

const rankClasses: { [key: number]: string } = {
  1: 'bg-primary text-white',
  2: 'bg-neutral-800 text-white',
  3: 'bg-neutral-300 text-black',
};

const ChapterLeaderboard: React.FC<ChapterLeaderboardProps> = ({
  title,
  data,
  unit,
}) => {
  const navigate = useNavigate();

  const handleChapterClick = (chapterName: string) => {
    navigate(`/chapters/${chapterName}`);
  };

  return (
    <div className="border-4 border-black bg-white">
      <h2 className="border-b-4 border-black p-4 text-xl font-bold text-black">
        {title}
      </h2>
      {data.length > 0 ? (
        <ul className="divide-y-4 divide-black">
          {data.map(({ chapter, value }, index) => {
            const rank = index + 1;
            const rankBG = rankClasses[rank] || 'bg-white text-black';
            return (
              <li
                key={chapter.name}
                onClick={() => handleChapterClick(chapter.name)}
                className="flex cursor-pointer items-stretch"
              >
                <div
                  className={`flex w-16 flex-shrink-0 items-center justify-center border-r-4 border-black text-2xl font-black ${rankBG}`}
                >
                  {rank}
                </div>
                <div className="flex flex-grow items-center p-4 transition-colors hover:bg-neutral-100">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 border-black bg-black">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="font-bold text-black">{chapter.name}</p>
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
        <div className="p-8 text-center text-neutral-500">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-neutral-300" />
          <p className="mt-2 font-semibold">No data available.</p>
          <p className="text-sm">There is no activity for this time period.</p>
        </div>
      )}
    </div>
  );
};

export default ChapterLeaderboard;
