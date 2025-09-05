import { Calendar, Trophy } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCurrentUser } from '@/store/auth.store';
import { Challenge } from '@/types';

interface ChallengesProps {
  challenges: Challenge[];
}

const Challenges: React.FC<ChallengesProps> = ({ challenges }) => {
  const currentUser = useCurrentUser();

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
        <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-foreground">
          Team-Based Challenges
        </h2>
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-bold text-foreground">
              No Active Challenges
            </h3>
            <p className="mt-2 text-muted-foreground">
              Check back later for new team-based challenges!
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-foreground">
        Team-Based Challenges
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {challengesWithSortedParticipants.map((challenge) => {
          const userChapters = currentUser?.chapters || [];

          return (
            <Card key={challenge.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{challenge.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 size-4" />
                  <span>
                    Ends: {new Date(challenge.endDate).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="grow">
                <h4 className="text-md mb-3 font-semibold">Leaderboard</h4>
                <div className="space-y-4">
                  {challenge.sortedParticipants.map((p, index) => {
                    const isUserChapter = userChapters.includes(p.name);
                    return (
                      <Card
                        key={p.id}
                        className={`p-3 transition-all ${
                          isUserChapter
                            ? 'bg-primary/10 ring-2 ring-primary'
                            : ''
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="mb-1.5 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {index === 0 && <Trophy className="size-5" />}
                              <span
                                className={`font-bold ${isUserChapter ? 'text-primary' : 'text-foreground'}`}
                              >
                                {p.name}
                              </span>
                              {isUserChapter && (
                                <Badge variant="default">YOUR CHAPTER</Badge>
                              )}
                            </div>
                            <span className="text-sm font-bold text-foreground">
                              {p.progress.toLocaleString()} {challenge.metric}
                            </span>
                          </div>
                          <Progress
                            value={(p.progress / challenge.goal) * 100}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default Challenges;
