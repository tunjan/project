import { Building, Calendar, ChevronRight } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ChapterMap from '@/components/chapters/ChapterMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useChapters, useEvents, useOutreachLogs, useUsers } from '@/store';
import { type Chapter, EventStatus } from '@/types';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Public stats directly from stores (works without auth)
  const users = useUsers();
  const events = useEvents();
  const chapters = useChapters();
  const outreachLogs = useOutreachLogs();

  const stats = useMemo(() => {
    const totalMembers = users.length;
    const eventsHeld = events.filter(
      (e) => e.status === EventStatus.FINISHED
    ).length;
    const conversationsLogged = outreachLogs.length;
    return { totalMembers, eventsHeld, conversationsLogged };
  }, [users.length, events, outreachLogs.length]);

  const handleSelectChapter = (chapter: Chapter) => {
    navigate('/signup', { state: { chapter: chapter.name } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Hero */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                    Join the Movement
                  </h1>
                  <p className="max-w-2xl text-muted-foreground">
                    Organize and attend impactful Cubes worldwide. Track events,
                    grow your chapter, and amplify animal rights together.
                  </p>
                </div>
                <div className="flex flex-row gap-3">
                  <Button variant="outline" asChild>
                    <Link to="/login" className="inline-flex items-center">
                      Login <ChevronRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup" className="inline-flex items-center">
                      Join the Hub <ChevronRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Global Impact */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-foreground">
            Global Impact
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {stats.totalMembers.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Events Held</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {stats.eventsHeld.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Conversations Logged
                </p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {stats.conversationsLogged.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="mb-12">
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Building className="size-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                Our Chapters
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Explore our global chapters. Click a marker to request to join.
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <ChapterMap
                chapters={chapters}
                onSelectChapter={handleSelectChapter}
                popupActionText="Request to Join"
              />
            </CardContent>
          </Card>
        </section>

        {/* Benefits for Activists */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-8">
              <div className="mb-6 flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">
                  Why Join?
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-foreground">
                      Find and join events
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Discover cubes near you and RSVP with one click.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-foreground">
                      Track your impact
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Log conversations and see your growth over time.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-foreground">
                      Build your chapter
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Manage members, announcements, and resources.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-foreground">
                      Global community
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Connect with activists around the world.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button variant="outline" asChild>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center"
                  >
                    Login <ChevronRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center"
                  >
                    Join the Hub <ChevronRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
