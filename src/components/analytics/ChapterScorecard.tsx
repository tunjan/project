import React, { useMemo } from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { calculateChapterScorecard, ScorecardData } from '@/utils/scorecard';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-600';
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
      <div className="border border-black bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-black text-xs uppercase text-neutral-500">
            <tr>
              <th className="p-3">Chapter</th>
              <th className="p-3 text-center">Health Score</th>
              <th className="p-3 text-center">Members</th>
              <th className="p-3 text-center">Events (3 mo)</th>
              <th className="p-3 text-center">Conversations (3 mo)</th>
            </tr>
          </thead>
          <tbody>
            {scorecardData.map((data) => (
              <tr key={data.name} className="border-t border-neutral-200">
                <td className="p-3 font-bold">{data.name}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center">
                    <span
                      className={`mr-2 h-3 w-3 rounded-full ${getScoreColor(
                        data.healthScore
                      )}`}
                    ></span>
                    <span className="font-bold">{data.healthScore}</span>
                  </div>
                </td>
                <td className="p-3 text-center">{data.memberCount}</td>
                <td className="p-3 text-center">{data.eventsHeld}</td>
                <td className="p-3 text-center">{data.totalConversations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ChapterScorecard;
