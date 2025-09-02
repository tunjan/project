import { useMemo } from 'react';

import { ProgressBar } from '@/components/ui';
import { CalendarIcon, TrophyIcon } from '@/icons';
import { useCurrentUser } from '@/store/auth.store';
import { Challenge } from '@/types';

interface ChallengesProps {
  challenges: Challenge[];
}

const Challenges: React.FC<ChallengesProps> = ({ challenges }) => {
  const currentUser = useCurrentUser();

  // FIX: Memoize sorted participants to avoid re-sorting on every render
  const challengesWithSortedParticipants = useMemo(() => {
    return challenges.map((challenge) => ({
      ...challenge,
      sortedParticipants: [...challenge.participants].sort(
        (a, b) => b.progress - a.progress
      ),
    }));
  }, [challenges]);

  if (challenges.length === 0) {
    return (
      <section className="py-12">
        <h2 className="mb-6 border-b-2 border-primary pb-3 text-3xl font-extrabold tracking-tight text-black">
          Team-Based Challenges
        </h2>
        <div className="border-black bg-white p-8 text-center md:border-2">
          <TrophyIcon className="mx-auto size-12" />
          <h3 className="mt-4 text-xl font-bold text-black">
            No Active Challenges
          </h3>
          <p className="mt-2 text-neutral-600">
            Check back later for new team-based challenges!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="mb-6 border-b-2 border-primary pb-3 text-3xl font-extrabold tracking-tight text-black">
        Team-Based Challenges
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {challengesWithSortedParticipants.map((challenge) => {
          const userChapters = currentUser?.chapters || [];

          return (
            <div
              key={challenge.id}
              className="flex flex-col border border-black bg-white"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-black">
                  {challenge.title}
                </h3>
                <p className="text-grey-600 mb-4 mt-2 text-sm">
                  {challenge.description}
                </p>
                <div className="flex items-center text-sm text-neutral-600">
                  <CalendarIcon className="mr-2 size-4" />
                  <span>
                    Ends: {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grow border-t border-black bg-white p-6">
                <h4 className="text-md mb-3 font-semibold text-black">
                  Leaderboard
                </h4>
                <div className="space-y-4">
                  {challenge.sortedParticipants.map((p, index) => {
                    const isUserChapter = userChapters.includes(p.name);
                    return (
                      <div
                        key={p.id}
                        className={`p-3 transition-all ${
                          isUserChapter
                            ? 'bg-primary/10 ring-2 ring-primary'
                            : ''
                        }`}
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {index === 0 && <TrophyIcon className="size-5" />}
                            <span
                              className={`font-bold ${isUserChapter ? 'text-primary' : 'text-black'}`}
                            >
                              {p.name}
                            </span>
                            {isUserChapter && (
                              <span className="bg-primary px-2 py-0.5 text-xs font-bold text-white">
                                YOUR CHAPTER
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-black">
                            {p.progress.toLocaleString()} {challenge.metric}
                          </span>
                        </div>
                        <ProgressBar value={p.progress} max={challenge.goal} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Challenges;
