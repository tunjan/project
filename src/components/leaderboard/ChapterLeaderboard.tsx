import { Building2, Trophy } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateRanks, type ChapterLeaderboardEntry } from '@/utils';

interface ChapterLeaderboardProps {
  title: string;
  data: ChapterLeaderboardEntry[];
  unit: string;
}

const ChapterRankIndicator: React.FC<{ rank: number }> = ({ rank }) => {
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <Badge
          variant="default"
          className="bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100"
        >
          <Trophy className="size-4" />
        </Badge>
      );
    }
    if (rank === 2) {
      return (
        <Badge
          variant="secondary"
          className="bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-100"
        >
          <Trophy className="size-4" />
        </Badge>
      );
    }
    if (rank === 3) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-600 text-amber-100 dark:bg-amber-700 dark:text-amber-100"
        >
          <Trophy className="size-4" />
        </Badge>
      );
    }
    return <Badge variant="outline">{rank}</Badge>;
  };

  return (
    <div className="flex w-16 shrink-0 items-center justify-center">
      {getRankBadge()}
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
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grow overflow-y-auto p-0">
        {rankedData.length > 0 ? (
          <ul className="space-y-2 p-4">
            {rankedData.map(({ chapter, value, rank }) => {
              return (
                <li
                  key={chapter.name}
                  className="rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  <Button
                    onClick={() => handleChapterClick(chapter.name)}
                    variant="ghost"
                    className="flex h-auto w-full cursor-pointer items-stretch p-0 hover:bg-accent"
                  >
                    <ChapterRankIndicator rank={rank} />
                    <div className="flex grow items-center p-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Building2 className="size-6 text-muted-foreground" />
                      </div>
                      <div className="ml-4 grow text-left">
                        <p className="truncate font-bold text-foreground">
                          {chapter.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {chapter.country}
                        </p>
                      </div>
                      <div className="ml-4 shrink-0 text-right">
                        <p className="text-2xl font-extrabold text-foreground">
                          {value.toLocaleString()}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {unit}
                        </p>
                      </div>
                    </div>
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Building2 className="size-12" />
            <p className="mt-2 font-semibold text-foreground">
              No data available.
            </p>
            <p className="text-sm">
              There is no activity for this time period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterLeaderboard;
