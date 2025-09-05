import React, { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { calculateChapterScorecard } from '@/utils';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-destructive';
};

const ChapterScorecard: React.FC = () => {
  const { chapterStats, isChapterView } = useAnalyticsData();

  const scorecardData = useMemo(() => {
    return calculateChapterScorecard(chapterStats).sort(
      (a, b) => b.healthScore - a.healthScore
    );
  }, [chapterStats]);

  if (isChapterView) {
    return null;
  }

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle>Chapter Health Scorecard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chapter</TableHead>
              <TableHead className="text-center">Health Score</TableHead>
              <TableHead className="text-center">Members</TableHead>
              <TableHead className="text-center">Events</TableHead>
              <TableHead className="text-center">Conversations</TableHead>
              <TableHead className="text-center">Convos/Hr</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scorecardData.map((data) => (
              <TableRow key={data.name}>
                <TableCell className="font-bold">{data.name}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <span
                      className={`mr-2 inline-block size-3 rounded-full ${getScoreColor(
                        data.healthScore
                      )}`}
                    ></span>
                    <span className="font-bold">{data.healthScore}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono">
                  {data.memberCount}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {data.eventsHeld}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {data.totalConversations}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {data.conversationsPerHour.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ChapterScorecard;
