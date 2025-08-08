// no React import needed with automatic JSX runtime
import { useChallenges } from '@/store/appStore';
import { useCurrentUser } from '@/store/auth.store';
import ProgressBar from '@/components/ui/ProgressBar';
import { TrophyIcon, CalendarIcon } from '@/icons';

const Challenges = () => {
  const challenges = useChallenges();
  const currentUser = useCurrentUser();

  if (challenges.length === 0) {
    return (
      <section className="py-12">
        <h2 className="mb-6 border-b-2 border-primary pb-3 text-3xl font-extrabold tracking-tight text-black">
          Team-Based Challenges
        </h2>
        <div className="border border-black bg-white p-8 text-center">
          <TrophyIcon className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-xl font-bold text-black">
            No Active Challenges
          </h3>
          <p className="mt-2 text-neutral-500">
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
        {challenges.map((challenge) => {
          const sortedParticipants = [...challenge.participants].sort(
            (a, b) => b.progress - a.progress
          );
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
                <p className="mb-4 mt-2 text-sm text-neutral-600">
                  {challenge.description}
                </p>
                <div className="flex items-center text-sm text-neutral-500">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Ends: {challenge.endDate.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex-grow border-t border-black bg-neutral-50 p-6">
                <h4 className="text-md mb-3 font-semibold text-black">
                  Leaderboard
                </h4>
                <div className="space-y-4">
                  {sortedParticipants.map((p, index) => {
                    const isUserChapter = userChapters.includes(p.name);
                    return (
                      <div
                        key={p.id}
                        className={`rounded-none p-3 transition-all ${
                          isUserChapter
                            ? 'bg-primary/10 ring-2 ring-primary'
                            : ''
                        }`}
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {index === 0 && <TrophyIcon className="h-5 w-5" />}
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
                          <span className="text-sm font-bold text-neutral-800">
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
