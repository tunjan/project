import { Building2, Clock, MessageCircle, Users } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChapterStats } from '@/utils';

interface ChapterCardProps {
  chapterStats: ChapterStats;
  onSelect: () => void;
  isUserChapter?: boolean;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapterStats,
  onSelect,
  isUserChapter = false,
}) => {
  return (
    <Card
      onClick={onSelect}
      className={`w-full cursor-pointer overflow-hidden text-left transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        isUserChapter ? 'bg-primary/5 ring-2 ring-primary' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {chapterStats.country}
        </p>
        <CardTitle className="mt-1 truncate text-2xl font-bold">
          {chapterStats.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">
              <Users className="size-5" />
            </div>
            <div>
              <p className="font-mono text-lg font-bold">
                {chapterStats.memberCount}
              </p>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="font-mono text-lg font-bold">
                {chapterStats.eventsHeld}
              </p>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="font-mono text-lg font-bold">
                {Math.round(chapterStats.totalHours)}
              </p>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Hours
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <p className="font-mono text-lg font-bold">
                {chapterStats.totalConversations}
              </p>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Convos
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterCard;
