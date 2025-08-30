import React, { useMemo } from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { calculateChapterScorecard } from '@/utils/scorecard';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-danger';
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
    <section className="mt-12">
      <h2 className="mb-4 border-b-2 border-primary pb-2 text-2xl font-bold text-black">
        Chapter Health Scorecard
      </h2>
      <div className="border-2 border-black bg-white">
        <table className="w-full text-left">
          <thead className="text-grey-600 border-b-2 border-black text-xs uppercase">
            <tr>
              <th className="p-3">Chapter</th>
              <th className="p-3 text-center">Health Score</th>
              <th className="p-3 text-center">Members</th>
              <th className="p-3 text-center">Events</th>
              <th className="p-3 text-center">Conversations</th>
              <th className="p-3 text-center">Convos/Hr</th>
            </tr>
          </thead>
          <tbody>
            {scorecardData.map((data) => (
              <tr key={data.name} className="border-t border-grey-200">
                <td className="p-3 font-bold">{data.name}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center">
                    <span
                      className={`mr-2 inline-block h-3 w-3 ${getScoreColor(
                        data.healthScore
                      )}`}
                    ></span>
                    <span className="font-bold">{data.healthScore}</span>
                  </div>
                </td>
                <td className="p-3 text-center font-mono">
                  {data.memberCount}
                </td>
                <td className="p-3 text-center font-mono">{data.eventsHeld}</td>
                <td className="p-3 text-center font-mono">
                  {data.totalConversations}
                </td>
                <td className="p-3 text-center font-mono">
                  {data.conversationsPerHour.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ChapterScorecard;
